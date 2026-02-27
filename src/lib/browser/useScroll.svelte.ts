/** Options for `useScroll`. */
export interface UseScrollOptions {
	/**
	 * Number of milliseconds to wait after the last scroll event before
	 * `isScrolling` is set back to `false`.
	 * @default 150
	 */
	throttle?: number;

	/**
	 * Distance in pixels from each edge that is considered "arrived".
	 * @default 0
	 */
	offset?: {
		top?: number;
		bottom?: number;
		left?: number;
		right?: number;
	};
}

/** Return value of `useScroll`. */
export interface UseScrollReturn {
	/** Reactive getter for the current horizontal scroll position in pixels. */
	x: () => number;
	/** Reactive getter for the current vertical scroll position in pixels. */
	y: () => number;
	/** `true` while the target is actively being scrolled. */
	isScrolling: () => boolean;
	/** Whether the scroll position has reached each edge. */
	arrivedState: {
		top: () => boolean;
		bottom: () => boolean;
		left: () => boolean;
		right: () => boolean;
	};
	/** Direction of the most recent scroll movement. */
	directions: {
		up: () => boolean;
		down: () => boolean;
		left: () => boolean;
		right: () => boolean;
	};
	/** Programmatically scroll the target. */
	scrollTo: (options: ScrollToOptions) => void;
}

/**
 * Reactive scroll-state tracker for `window` or any scrollable `HTMLElement`.
 *
 * Tracks scroll position (`x`, `y`), direction, edge-arrival, and an
 * `isScrolling` flag (debounced back to `false` after the last scroll event).
 *
 * @param target - `window`, an `HTMLElement`, or a getter/`undefined` (defaults to `window`)
 * @param options - Optional configuration
 *
 * @example
 * ```ts
 * // Track window scroll
 * const { y, isScrolling, arrivedState } = useScroll();
 *
 * // Track a specific element
 * let el = $state<HTMLElement | null>(null);
 * const scroll = useScroll(() => el);
 * ```
 */
export function useScroll(
	target?: Window | HTMLElement | (() => HTMLElement | null | undefined) | null,
	options: UseScrollOptions = {}
): UseScrollReturn {
	const debounceMs = options.throttle ?? 150;
	const offsetTop = options.offset?.top ?? 0;
	const offsetBottom = options.offset?.bottom ?? 0;
	const offsetLeft = options.offset?.left ?? 0;
	const offsetRight = options.offset?.right ?? 0;

	let x = $state(0);
	let y = $state(0);
	let isScrolling = $state(false);
	let arrivedTop = $state(true);
	let arrivedBottom = $state(false);
	let arrivedLeft = $state(true);
	let arrivedRight = $state(false);
	let dirUp = $state(false);
	let dirDown = $state(false);
	let dirLeft = $state(false);
	let dirRight = $state(false);

	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	function resolveTarget(): Window | HTMLElement | null {
		if (typeof window === 'undefined') return null;
		if (target === undefined || target === null) return window;
		if (target === window || target instanceof HTMLElement) return target;
		if (typeof target === 'function') return target() ?? null;
		return null;
	}

	function getScrollMetrics(el: Window | HTMLElement) {
		if (el === window) {
			return {
				scrollLeft: window.scrollX,
				scrollTop: window.scrollY,
				scrollWidth: document.documentElement.scrollWidth,
				scrollHeight: document.documentElement.scrollHeight,
				clientWidth: document.documentElement.clientWidth,
				clientHeight: document.documentElement.clientHeight
			};
		}
		const e = el as HTMLElement;
		return {
			scrollLeft: e.scrollLeft,
			scrollTop: e.scrollTop,
			scrollWidth: e.scrollWidth,
			scrollHeight: e.scrollHeight,
			clientWidth: e.clientWidth,
			clientHeight: e.clientHeight
		};
	}

	function onScroll() {
		const el = resolveTarget();
		if (!el) return;

		const metrics = getScrollMetrics(el);
		const prevX = x;
		const prevY = y;

		x = metrics.scrollLeft;
		y = metrics.scrollTop;

		dirUp = y < prevY;
		dirDown = y > prevY;
		dirLeft = x < prevX;
		dirRight = x > prevX;

		arrivedTop = y <= offsetTop;
		arrivedLeft = x <= offsetLeft;
		arrivedBottom = y + metrics.clientHeight >= metrics.scrollHeight - offsetBottom;
		arrivedRight = x + metrics.clientWidth >= metrics.scrollWidth - offsetRight;

		isScrolling = true;

		if (debounceTimer !== undefined) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			isScrolling = false;
			dirUp = false;
			dirDown = false;
			dirLeft = false;
			dirRight = false;
		}, debounceMs);
	}

	$effect(() => {
		if (typeof window === 'undefined') return;

		const el = resolveTarget();
		if (!el) return;

		// Initialise scroll position from current state
		const initial = getScrollMetrics(el);
		x = initial.scrollLeft;
		y = initial.scrollTop;
		arrivedTop = y <= offsetTop;
		arrivedLeft = x <= offsetLeft;
		arrivedBottom = y + initial.clientHeight >= initial.scrollHeight - offsetBottom;
		arrivedRight = x + initial.clientWidth >= initial.scrollWidth - offsetRight;

		el.addEventListener('scroll', onScroll, { passive: true });

		return () => {
			el.removeEventListener('scroll', onScroll);
			if (debounceTimer !== undefined) {
				clearTimeout(debounceTimer);
				debounceTimer = undefined;
			}
		};
	});

	function scrollTo(scrollOptions: ScrollToOptions) {
		if (typeof window === 'undefined') return;
		const el = resolveTarget();
		if (!el) return;
		el.scrollTo(scrollOptions);
	}

	return {
		x: () => x,
		y: () => y,
		isScrolling: () => isScrolling,
		arrivedState: {
			top: () => arrivedTop,
			bottom: () => arrivedBottom,
			left: () => arrivedLeft,
			right: () => arrivedRight
		},
		directions: {
			up: () => dirUp,
			down: () => dirDown,
			left: () => dirLeft,
			right: () => dirRight
		},
		scrollTo
	};
}

/** Options for `useElementBounding`. */
export interface UseElementBoundingOptions {
	/** Reset every value to `0` when the target becomes `null`. Default `true`. */
	reset?: boolean;
	/** Recalculate on window `resize`. Default `true`. */
	windowResize?: boolean;
	/**
	 * Recalculate on window `scroll`. The rect is viewport-relative, so scrolling changes
	 * `top`/`bottom` even when the element has not moved. Default `true`.
	 */
	windowScroll?: boolean;
}

/** Return value of `useElementBounding`. */
export interface UseElementBoundingReturn {
	/** Viewport-relative x coordinate (same as `left`). */
	x: () => number;
	/** Viewport-relative y coordinate (same as `top`). */
	y: () => number;
	/** Distance from the top of the viewport. */
	top: () => number;
	/** Distance from the left of the viewport to the element's right edge. */
	right: () => number;
	/** Distance from the top of the viewport to the element's bottom edge. */
	bottom: () => number;
	/** Distance from the left of the viewport. */
	left: () => number;
	/** Border-box width. */
	width: () => number;
	/** Border-box height. */
	height: () => number;
	/** Recalculates immediately. */
	update: () => void;
}

/** Reactive `getBoundingClientRect()` for an element. */
export function useElementBounding(
	target: () => Element | null | undefined,
	options: UseElementBoundingOptions = {}
): UseElementBoundingReturn {
	const { reset = true, windowResize = true, windowScroll = true } = options;

	let x = $state(0);
	let y = $state(0);
	let top = $state(0);
	let right = $state(0);
	let bottom = $state(0);
	let left = $state(0);
	let width = $state(0);
	let height = $state(0);

	function clear() {
		x = 0;
		y = 0;
		top = 0;
		right = 0;
		bottom = 0;
		left = 0;
		width = 0;
		height = 0;
	}

	function update() {
		const element = target();

		if (!element) {
			if (reset) clear();
			return;
		}

		const rect = element.getBoundingClientRect();
		x = rect.x;
		y = rect.y;
		top = rect.top;
		right = rect.right;
		bottom = rect.bottom;
		left = rect.left;
		width = rect.width;
		height = rect.height;
	}

	$effect(() => {
		const element = target();

		if (typeof window === 'undefined') return;

		if (!element) {
			if (reset) clear();
			return;
		}

		update();

		// ResizeObserver catches the element's own size changes; scroll and
		// resize catch movement that leaves its size untouched.
		const observer = new ResizeObserver(update);
		observer.observe(element);

		if (windowResize) window.addEventListener('resize', update, { passive: true });
		// `capture` so scrolling inside any ancestor container counts, not just
		// the document.
		if (windowScroll) {
			window.addEventListener('scroll', update, { capture: true, passive: true });
		}

		return () => {
			observer.disconnect();
			if (windowResize) window.removeEventListener('resize', update);
			if (windowScroll) window.removeEventListener('scroll', update, { capture: true });
		};
	});

	return {
		x: () => x,
		y: () => y,
		top: () => top,
		right: () => right,
		bottom: () => bottom,
		left: () => left,
		width: () => width,
		height: () => height,
		update
	};
}

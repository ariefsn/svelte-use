/** Options for `useWindowSize`. */
export interface UseWindowSizeOptions {
	/**
	 * Include the scrollbar in the reported width/height.
	 *
	 * `true` uses `window.innerWidth`/`innerHeight`, which count the
	 * scrollbar. `false` uses `document.documentElement.clientWidth`/
	 * `clientHeight`, which match what CSS media queries measure.
	 *
	 * @default true
	 */
	includeScrollbar?: boolean;
	/**
	 * Width reported before the first measurement, i.e. during SSR.
	 * @default 0
	 */
	initialWidth?: number;
	/**
	 * Height reported before the first measurement, i.e. during SSR.
	 * @default 0
	 */
	initialHeight?: number;
}

/** Return value of `useWindowSize`. */
export interface UseWindowSizeReturn {
	/** Reactive getter for the viewport width in pixels. */
	width: () => number;
	/** Reactive getter for the viewport height in pixels. */
	height: () => number;
}

/**
 * Reactive viewport dimensions.
 *
 * Tracks `resize` and `orientationchange`, so it stays correct when a mobile
 * device is rotated — which does not always fire `resize` on its own.
 *
 * SSR safe: returns `initialWidth`/`initialHeight` on the server and measures
 * for real once the effect runs in the browser.
 *
 * @param options - Optional configuration
 * @returns Object with reactive `width` and `height` getters
 *
 * @example
 * ```ts
 * const { width, height } = useWindowSize();
 * // width() → 1280
 * ```
 *
 * @example
 * ```ts
 * // Match what CSS media queries see, excluding the scrollbar
 * const { width } = useWindowSize({ includeScrollbar: false });
 * ```
 */
export function useWindowSize(options: UseWindowSizeOptions = {}): UseWindowSizeReturn {
	const { includeScrollbar = true, initialWidth = 0, initialHeight = 0 } = options;

	let width = $state(initialWidth);
	let height = $state(initialHeight);

	$effect(() => {
		if (typeof window === 'undefined') return;

		function update() {
			if (includeScrollbar) {
				width = window.innerWidth;
				height = window.innerHeight;
			} else {
				width = document.documentElement.clientWidth;
				height = document.documentElement.clientHeight;
			}
		}

		update();

		window.addEventListener('resize', update, { passive: true });
		// Some mobile browsers fire only this on rotation.
		window.addEventListener('orientationchange', update, { passive: true });

		return () => {
			window.removeEventListener('resize', update);
			window.removeEventListener('orientationchange', update);
		};
	});

	return {
		width: () => width,
		height: () => height
	};
}

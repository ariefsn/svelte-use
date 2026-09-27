/** Options for `useWindowSize`. */
export interface UseWindowSizeOptions {
	/** Include the scrollbar in the reported width/height. Default `true`. */
	includeScrollbar?: boolean;
	/** Width reported before the first measurement, i.e. during SSR. Default `0`. */
	initialWidth?: number;
	/** Height reported before the first measurement, i.e. during SSR. Default `0`. */
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
 * Reactive viewport dimensions. Tracks `resize` and `orientationchange`, so it stays correct when a
 * mobile device is rotated — which does not always fire `resize` on its own.
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

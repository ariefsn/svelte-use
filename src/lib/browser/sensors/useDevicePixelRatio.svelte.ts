export interface UseDevicePixelRatioReturn {
	/** Whether devicePixelRatio is supported */
	isSupported: () => boolean;
	/** The current device pixel ratio */
	current: () => number;
}

/**
 * Reactively tracks the device pixel ratio (DPR).
 *
 * Useful for detecting high-DPI/Retina displays and optimizing rendering.
 *
 * @returns Object with `isSupported` and reactive `current` getter
 *
 * @example
 * ```ts
 * const { current } = useDevicePixelRatio();
 * // current() → 2 (on Retina displays)
 * ```
 */
export function useDevicePixelRatio(): UseDevicePixelRatioReturn {
	const isBrowser = typeof window !== 'undefined';
	const supported = isBrowser && 'devicePixelRatio' in window;

	let ratio = $state(isBrowser ? window.devicePixelRatio : 1);

	$effect(() => {
		if (!supported) return;

		// Reading `ratio` here is load-bearing, not incidental: a
		// `(resolution: Xdppx)` query only fires when the DPR *leaves* X, so the
		// listener must be rebuilt around each new value. Tracking `ratio` makes
		// this effect re-run and re-subscribe after every change.
		//
		// This is safe despite the effect also writing `ratio` (via the handler)
		// because the write happens in an event callback, not during the run —
		// so there is no read-modify-write cycle. Do not "optimise" the read
		// away with untrack(); that would freeze the listener on the initial
		// ratio and it would fire exactly once.
		const mql = window.matchMedia(`(resolution: ${ratio}dppx)`);

		function onChange() {
			ratio = window.devicePixelRatio;
		}

		mql.addEventListener('change', onChange);

		return () => {
			mql.removeEventListener('change', onChange);
		};
	});

	return {
		isSupported: () => supported,
		current: () => ratio
	};
}

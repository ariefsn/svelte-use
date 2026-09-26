import { useSupported } from '../useSupported.svelte.js';

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
 * Updates when the user zooms or the window moves to a display with a
 * different pixel density.
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
	const isSupported = useSupported(() => 'devicePixelRatio' in window);

	let ratio = $state(isSupported() ? window.devicePixelRatio : 1);

	$effect(() => {
		if (!isSupported()) return;

		// Reading `ratio` here is load-bearing, not incidental: a
		// `(resolution: Xdppx)` query only fires when the DPR *leaves* X, so
		// the listener must be rebuilt around each new value. Tracking `ratio`
		// makes this effect re-run and re-subscribe after every change.
		//
		// Safe despite the effect also writing `ratio` (via the handler),
		// because that write happens in an event callback rather than during
		// the run — so there is no read-modify-write cycle. Do not "optimise"
		// the read away with untrack(); the listener would freeze on the
		// initial ratio and fire exactly once.
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
		isSupported,
		current: () => ratio
	};
}

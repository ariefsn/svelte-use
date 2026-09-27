import { useSupported } from '../useSupported.svelte.js';

export interface UseDevicePixelRatioReturn {
	/** Whether devicePixelRatio is supported */
	isSupported: () => boolean;
	/** The current device pixel ratio */
	current: () => number;
}

/** Reactively tracks the device pixel ratio (DPR) for Retina display detection. */
export function useDevicePixelRatio(): UseDevicePixelRatioReturn {
	const isSupported = useSupported(() => 'devicePixelRatio' in window);

	let ratio = $state(isSupported() ? window.devicePixelRatio : 1);

	$effect(() => {
		if (!isSupported()) return;

		// Reading `ratio` is load-bearing: a `(resolution: Xdppx)` query only fires when DPR
		// *leaves* X, so the listener must be rebuilt per value. Do not untrack this read.
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

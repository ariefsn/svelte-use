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

		function update() {
			ratio = window.devicePixelRatio;
		}

		// matchMedia approach: watch for DPR changes
		const mql = window.matchMedia(`(resolution: ${ratio}dppx)`);

		function onChange() {
			update();
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

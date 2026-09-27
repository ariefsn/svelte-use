import { useSupported } from '../useSupported.svelte.js';

export interface UseDeviceOrientationReturn {
	/** Whether the DeviceOrientationEvent API is supported */
	isSupported: () => boolean;
	/** Whether orientation data is absolute */
	isAbsolute: () => boolean;
	/** Rotation around z-axis (0-360°) */
	alpha: () => number | null;
	/** Rotation around x-axis (-180 to 180°) */
	beta: () => number | null;
	/** Rotation around y-axis (-90 to 90°) */
	gamma: () => number | null;
}

/** Reactive wrapper around the DeviceOrientation API for tracking physical device orientation. */
export function useDeviceOrientation(): UseDeviceOrientationReturn {
	const isSupported = useSupported(() => 'DeviceOrientationEvent' in window);

	let isAbsolute = $state(false);
	let alpha = $state<number | null>(null);
	let beta = $state<number | null>(null);
	let gamma = $state<number | null>(null);

	$effect(() => {
		if (!isSupported()) return;

		function handler(e: DeviceOrientationEvent) {
			isAbsolute = e.absolute;
			alpha = e.alpha;
			beta = e.beta;
			gamma = e.gamma;
		}

		window.addEventListener('deviceorientation', handler);

		return () => {
			window.removeEventListener('deviceorientation', handler);
		};
	});

	return {
		isSupported,
		isAbsolute: () => isAbsolute,
		alpha: () => alpha,
		beta: () => beta,
		gamma: () => gamma
	};
}

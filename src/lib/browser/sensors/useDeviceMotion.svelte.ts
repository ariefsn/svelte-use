export interface UseDeviceMotionReturn {
	/** Whether the DeviceMotionEvent API is supported */
	isSupported: () => boolean;
	/** Device acceleration excluding gravity (m/s²) */
	acceleration: () => DeviceMotionEventAcceleration | null;
	/** Device acceleration including gravity (m/s²) */
	accelerationIncludingGravity: () => DeviceMotionEventAcceleration | null;
	/** Device rotation rate (deg/s) */
	rotationRate: () => DeviceMotionEventRotationRate | null;
	/** Data sampling interval (ms) */
	interval: () => number;
}

/**
 * Reactive wrapper around the DeviceMotion API.
 *
 * @returns Object with `isSupported`, `acceleration`, `accelerationIncludingGravity`, `rotationRate`, `interval`
 *
 * @example
 * ```ts
 * const { isSupported, acceleration } = useDeviceMotion();
 * // acceleration()?.x, acceleration()?.y, acceleration()?.z
 * ```
 */
export function useDeviceMotion(): UseDeviceMotionReturn {
	const isBrowser = typeof window !== 'undefined';
	const supported = isBrowser && 'DeviceMotionEvent' in window;

	let acceleration = $state<DeviceMotionEventAcceleration | null>(null);
	let accelerationIncludingGravity = $state<DeviceMotionEventAcceleration | null>(null);
	let rotationRate = $state<DeviceMotionEventRotationRate | null>(null);
	let interval = $state(0);

	$effect(() => {
		if (!supported) return;

		function handler(e: DeviceMotionEvent) {
			acceleration = e.acceleration;
			accelerationIncludingGravity = e.accelerationIncludingGravity;
			rotationRate = e.rotationRate;
			interval = e.interval;
		}

		window.addEventListener('devicemotion', handler);

		return () => {
			window.removeEventListener('devicemotion', handler);
		};
	});

	return {
		isSupported: () => supported,
		acceleration: () => acceleration,
		accelerationIncludingGravity: () => accelerationIncludingGravity,
		rotationRate: () => rotationRate,
		interval: () => interval
	};
}

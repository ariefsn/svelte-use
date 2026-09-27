import { useSupported } from '../useSupported.svelte.js';

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

/** Reactive wrapper around the DeviceMotion API for tracking device acceleration and rotation. */
export function useDeviceMotion(): UseDeviceMotionReturn {
	const isSupported = useSupported(() => 'DeviceMotionEvent' in window);

	let acceleration = $state<DeviceMotionEventAcceleration | null>(null);
	let accelerationIncludingGravity = $state<DeviceMotionEventAcceleration | null>(null);
	let rotationRate = $state<DeviceMotionEventRotationRate | null>(null);
	let interval = $state(0);

	$effect(() => {
		if (!isSupported()) return;

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
		isSupported,
		acceleration: () => acceleration,
		accelerationIncludingGravity: () => accelerationIncludingGravity,
		rotationRate: () => rotationRate,
		interval: () => interval
	};
}

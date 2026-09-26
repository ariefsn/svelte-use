import { useSupported } from './useSupported.svelte.js';

export interface UseVibrateReturn {
	/** Whether the Vibration API is supported */
	isSupported: () => boolean;
	/** Starts vibration with the configured pattern */
	vibrate: (pattern?: VibratePattern) => boolean;
	/** Stops any ongoing vibration */
	stop: () => void;
}

/**
 * Reactive wrapper around the Vibration API.
 *
 * @param pattern - Default vibration pattern in ms (default: `200`)
 * @returns Object with `isSupported`, `vibrate`, and `stop`
 *
 * @example
 * ```ts
 * const { isSupported, vibrate, stop } = useVibrate();
 * vibrate([200, 100, 200]); // vibrate-pause-vibrate
 * stop();
 * ```
 */
export function useVibrate(pattern: VibratePattern = 200): UseVibrateReturn {
	const isSupported = useSupported(() => 'vibrate' in navigator);

	function vibrate(p?: VibratePattern): boolean {
		if (!isSupported()) return false;
		return navigator.vibrate(p ?? pattern);
	}

	function stop() {
		if (isSupported()) {
			navigator.vibrate(0);
		}
	}

	return {
		isSupported,
		vibrate,
		stop
	};
}

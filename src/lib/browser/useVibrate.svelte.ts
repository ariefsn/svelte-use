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
	const isBrowser = typeof navigator !== 'undefined';
	const supported = isBrowser && 'vibrate' in navigator;

	function vibrate(p?: VibratePattern): boolean {
		if (!supported) return false;
		return navigator.vibrate(p ?? pattern);
	}

	function stop() {
		if (supported) {
			navigator.vibrate(0);
		}
	}

	return {
		isSupported: () => supported,
		vibrate,
		stop
	};
}

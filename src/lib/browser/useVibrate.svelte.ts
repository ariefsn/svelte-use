import { useSupported } from './useSupported.svelte.js';

export interface UseVibrateReturn {
	/** Whether the Vibration API is supported */
	isSupported: () => boolean;
	/** Starts vibration with the configured pattern */
	vibrate: (pattern?: VibratePattern) => boolean;
	/** Stops any ongoing vibration */
	stop: () => void;
}

/** Reactive wrapper around the Vibration API. */
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

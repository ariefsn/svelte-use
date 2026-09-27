import { toGetter, type MaybeGetter } from '../../internal/toGetter.js';
import { getMediaDevices } from './internal/mediaDevices.js';
import { useMediaStream, type UseMediaStreamReturn } from './internal/useMediaStream.svelte.js';

/** Options for `useDisplayMedia`. */
export interface UseDisplayMediaOptions {
	/**
	 * Options passed to `getDisplayMedia`, or a getter for reactive ones. Default `{ video: true }`.
	 */
	options?: MaybeGetter<DisplayMediaStreamOptions>;
}

/** Return value of `useDisplayMedia`. */
export type UseDisplayMediaReturn = UseMediaStreamReturn;

/**
 * Screen, window or tab capture via `getDisplayMedia`. Watches for the browser’s own “Stop sharing”
 * control, which ends the tracks without notifying the page.
 */
export function useDisplayMedia(options: UseDisplayMediaOptions = {}): UseDisplayMediaReturn {
	const getOptions = toGetter(options.options ?? { video: true });

	return useMediaStream({
		probe: () => {
			const devices = getMediaDevices();
			return devices !== null && typeof devices.getDisplayMedia === 'function';
		},
		request: (devices) => devices.getDisplayMedia(getOptions())
		// No `revision`: see the note on `options` above.
	});
}

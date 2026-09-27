import { toGetter, type MaybeGetter } from '../../internal/toGetter.js';
import { getMediaDevices } from './internal/mediaDevices.js';
import { useMediaStream, type UseMediaStreamReturn } from './internal/useMediaStream.svelte.js';

/** Which way a preview is mirrored. */
export type UserMediaFlip = 'none' | 'horizontal' | 'vertical' | 'both';

const FLIP_TRANSFORMS: Readonly<Record<UserMediaFlip, string>> = {
	none: 'none',
	horizontal: 'scaleX(-1)',
	vertical: 'scaleY(-1)',
	both: 'scale(-1, -1)'
};

/** Options for `useUserMedia`. */
export interface UseUserMediaOptions {
	/**
	 * Constraints passed to `getUserMedia`, or a getter for reactive ones. Default `{ audio: true,
	 * video: true }`.
	 */
	constraints?: MaybeGetter<MediaStreamConstraints>;
	/** How to mirror the **preview**, or a getter for a reactive value. Default `'none'`. */
	flip?: MaybeGetter<UserMediaFlip>;
}

/** Return value of `useUserMedia`. */
export interface UseUserMediaReturn extends UseMediaStreamReturn {
	/** The current flip setting. */
	flip: () => UserMediaFlip;
	/**
	 * A CSS `transform` value for the preview element — `'scaleX(-1)'` for a horizontal flip,
	 * `'none'` when not flipping.
	 */
	transform: () => string;
}

/**
 * Camera and microphone capture via `getUserMedia`. Nothing is requested until `start()` is called,
 * and changing `constraints` while a stream is live reacquires it — which is how you switch device.
 */
export function useUserMedia(options: UseUserMediaOptions = {}): UseUserMediaReturn {
	const getConstraints = toGetter(options.constraints ?? { audio: true, video: true });
	const getFlip = toGetter(options.flip ?? 'none');

	const media = useMediaStream({
		probe: () => {
			const devices = getMediaDevices();
			return devices !== null && typeof devices.getUserMedia === 'function';
		},
		request: (devices) => devices.getUserMedia(getConstraints()),
		// Serialising is what makes an inline object literal usable as a getter: a fresh `{ video: true
		// }` each run is a new reference but the same request, and should not trigger a reacquire.
		revision: () => JSON.stringify(getConstraints())
	});

	return {
		...media,
		flip: () => getFlip(),
		transform: () => FLIP_TRANSFORMS[getFlip()]
	};
}

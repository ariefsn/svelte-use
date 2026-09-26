import { toGetter, type MaybeGetter } from '../../internal/toGetter.js';
import { getMediaDevices } from './internal/mediaDevices.js';
import { useMediaStream, type UseMediaStreamReturn } from './internal/useMediaStream.svelte.js';

/**
 * Which way a preview is mirrored.
 *
 * `horizontal` is the self-view convention — it matches what a mirror shows,
 * so raising your right hand moves the hand on the right of the picture.
 */
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
	 * Constraints passed to `getUserMedia`, or a getter for reactive ones.
	 *
	 * Changing them while a stream is live stops it and reacquires with the
	 * new constraints — which is how you switch camera or microphone.
	 * @default { audio: true, video: true }
	 */
	constraints?: MaybeGetter<MediaStreamConstraints>;
	/**
	 * How to mirror the **preview**, or a getter for a reactive value.
	 *
	 * This is a display concern only: it produces a CSS transform for the
	 * element showing the stream and does not touch the captured pixels, so a
	 * recording or upload is unaffected. That is the behaviour you want —
	 * a self-view reads correctly when mirrored, but the person on the other
	 * end of a call should see you the right way round.
	 * @default 'none'
	 */
	flip?: MaybeGetter<UserMediaFlip>;
}

/** Return value of `useUserMedia`. */
export interface UseUserMediaReturn extends UseMediaStreamReturn {
	/** The current flip setting. */
	flip: () => UserMediaFlip;
	/**
	 * A CSS `transform` value for the preview element — `'scaleX(-1)'` for a
	 * horizontal flip, `'none'` when not flipping.
	 */
	transform: () => string;
}

/**
 * Camera and microphone capture via `getUserMedia`.
 *
 * Nothing happens until `start()` is called: acquiring a stream shows a
 * permission prompt, which should follow a user action rather than a page
 * load. Calling `start()` twice in a tick yields one stream and one prompt.
 *
 * Changing `constraints` while a stream is live reacquires it, so switching
 * device is a constraints change rather than a manual stop/start. Changing
 * `flip` does not — mirroring is a CSS transform on the preview, so it costs
 * nothing and never interrupts capture.
 *
 * SSR: `isSupported()` is `false` and `start()` resolves `null`.
 *
 * @param options - Constraints and preview mirroring for the capture
 * @returns Stream state plus `start`, `stop`, `restart` and the preview `transform`
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useUserMedia } from '@ariefsn/svelte-use';
 *
 *   let video = $state<HTMLVideoElement | null>(null);
 *   // Mirrored self-view, the convention for a front-facing camera
 *   const camera = useUserMedia({ flip: 'horizontal' });
 *
 *   $effect(() => {
 *     if (video) video.srcObject = camera.stream();
 *   });
 * </script>
 *
 * <button onclick={() => camera.start()}>Start</button>
 * <video bind:this={video} autoplay muted style:transform={camera.transform()}></video>
 * ```
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
		// Serialising is what makes an inline object literal usable as a
		// getter: a fresh `{ video: true }` each run is a new reference but
		// the same request, and should not trigger a reacquire.
		// `flip` is deliberately absent — it changes no pixels, so reacquiring
		// on a flip would re-prompt for nothing.
		revision: () => JSON.stringify(getConstraints())
	});

	return {
		...media,
		flip: () => getFlip(),
		transform: () => FLIP_TRANSFORMS[getFlip()]
	};
}

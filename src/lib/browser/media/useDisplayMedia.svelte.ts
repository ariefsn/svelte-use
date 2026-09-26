import { toGetter, type MaybeGetter } from '../../internal/toGetter.js';
import { getMediaDevices } from './internal/mediaDevices.js';
import { useMediaStream, type UseMediaStreamReturn } from './internal/useMediaStream.svelte.js';

/** Options for `useDisplayMedia`. */
export interface UseDisplayMediaOptions {
	/**
	 * Options passed to `getDisplayMedia`, or a getter for reactive ones.
	 *
	 * Unlike `useUserMedia`, changing these does **not** reacquire a live
	 * stream: screen capture always opens a picker, and re-prompting on a
	 * state change would be hostile. They apply to the next `start()`.
	 * @default { video: true }
	 */
	options?: MaybeGetter<DisplayMediaStreamOptions>;
}

/** Return value of `useDisplayMedia`. */
export type UseDisplayMediaReturn = UseMediaStreamReturn;

/**
 * Screen, window or tab capture via `getDisplayMedia`.
 *
 * `start()` opens the browser's picker and must be called from a user
 * gesture. Ending capture from the browser's own "Stop sharing" control ends
 * the tracks without notifying the page, so this watches for that and clears
 * `stream()` — a naive wrapper reports a live stream forever afterwards.
 *
 * SSR: `isSupported()` is `false` and `start()` resolves `null`.
 *
 * @param options - Display capture options
 * @returns Stream state plus `start`, `stop` and `restart`
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useDisplayMedia } from '@ariefsn/svelte-use';
 *
 *   const screen = useDisplayMedia({ options: { video: true, audio: false } });
 * </script>
 *
 * <button onclick={() => screen.start()}>Share screen</button>
 * {#if screen.isActive()}
 *   <button onclick={screen.stop}>Stop</button>
 * {/if}
 * ```
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

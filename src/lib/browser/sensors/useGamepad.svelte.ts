import { untrack } from 'svelte';
import { useRafFn } from '../../animation/useRafFn.svelte.js';
import { useEventListener } from '../useEventListener.svelte.js';
import { useSupported } from '../useSupported.svelte.js';

/** Options for `useGamepad`. */
export interface UseGamepadOptions {
	/**
	 * Cap the polling rate, in frames per second. Unlimited when omitted.
	 *
	 * Buttons and axes only change as fast as a human moves them, so a limit
	 * around 30 is usually indistinguishable and halves the work.
	 */
	fpsLimit?: number;
}

/** Return value of `useGamepad`. */
export interface UseGamepadReturn {
	/** Whether the Gamepad API is available. */
	isSupported: () => boolean;
	/** Connected gamepads, refreshed every frame while any are present. */
	gamepads: () => readonly Gamepad[];
	/** Whether at least one gamepad is connected. */
	isConnected: () => boolean;
	/** Whether the polling loop is currently running. */
	isPolling: () => boolean;
	/** Stops polling. State freezes at the last read. */
	pause: () => void;
	/** Resumes polling. */
	resume: () => void;
}

/**
 * Connected gamepads, with button and axis state.
 *
 * The Gamepad API has no events for button or stick movement — the only way to
 * read them is to call `navigator.getGamepads()` every frame, so this runs a
 * `useRafFn` loop. That loop is **started only while a gamepad is connected**
 * and stopped again when the last one disconnects, so a page with no
 * controller attached does no per-frame work.
 *
 * `getGamepads()` returns fresh snapshot objects on each call rather than
 * live-updating ones, which is why the array is replaced wholesale every frame.
 *
 * Browsers also hide gamepads until the user has interacted with one, so an
 * empty list on load is normal — press a button to make it appear.
 *
 * SSR: `isSupported()` is `false` and the list is empty.
 *
 * @param options - Polling rate cap
 * @returns Gamepad state plus `pause` and `resume`
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useGamepad } from '@ariefsn/svelte-use';
 *
 *   const pads = useGamepad({ fpsLimit: 30 });
 *   const first = $derived(pads.gamepads()[0]);
 * </script>
 *
 * {#if first}
 *   <p>{first.id} — A pressed: {first.buttons[0]?.pressed}</p>
 * {:else}
 *   <p>Press a button on a connected controller.</p>
 * {/if}
 * ```
 */
export function useGamepad(options: UseGamepadOptions = {}): UseGamepadReturn {
	const { fpsLimit } = options;

	const isSupported = useSupported(() => typeof navigator?.getGamepads === 'function');

	let gamepads = $state<readonly Gamepad[]>([]);

	/** Reads the API without touching reactive state. */
	function read(): readonly Gamepad[] {
		if (!isSupported()) return [];
		// Entries are `null` for disconnected slots, so the list is compacted.
		return navigator.getGamepads().filter((pad): pad is Gamepad => pad !== null);
	}

	function poll(): void {
		gamepads = read();
	}

	const loop = useRafFn(poll, { immediate: false, fpsLimit });

	/**
	 * Polls only while something is connected, so an idle page costs nothing.
	 *
	 * Deliberately decides from the freshly read list rather than from
	 * `gamepads`: this runs inside an `$effect`, and reading the same state it
	 * writes would make the effect re-trigger itself forever.
	 */
	function syncLoop(): void {
		const pads = read();
		gamepads = pads;
		if (pads.length > 0) loop.resume();
		else loop.pause();
	}

	useEventListener(() => window, 'gamepadconnected', syncLoop);
	useEventListener(() => window, 'gamepaddisconnected', syncLoop);

	$effect(() => {
		// A gamepad the user already pressed before this mounted is visible
		// immediately, without waiting for a connect event.
		//
		// `untrack` is load-bearing. `useRafFn.resume()` reads its own `active`
		// state internally, so calling it inside a tracking pass would make
		// this effect depend on it: a later `pause()` would re-run the effect,
		// which would resume again, and the loop could never be stopped. The
		// read-write cycle is invisible here — it lives inside the primitive.
		untrack(() => syncLoop());
	});

	return {
		isSupported,
		gamepads: () => gamepads,
		isConnected: () => gamepads.length > 0,
		isPolling: loop.isActive,
		pause: loop.pause,
		resume: loop.resume
	};
}

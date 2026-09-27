import { untrack } from 'svelte';
import { useRafFn } from '../../animation/useRafFn.svelte.js';
import { useEventListener } from '../useEventListener.svelte.js';
import { useSupported } from '../useSupported.svelte.js';

/** Options for `useGamepad`. */
export interface UseGamepadOptions {
	/** Cap the polling rate, in frames per second. Unlimited when omitted. */
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
 * Connected gamepads, with button and axis state. The Gamepad API has no events for stick or button
 * movement, so this polls each frame — but **only while a controller is connected**.
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

	/** Polls only while something is connected, so an idle page costs nothing. */
	function syncLoop(): void {
		const pads = read();
		gamepads = pads;
		if (pads.length > 0) loop.resume();
		else loop.pause();
	}

	useEventListener(() => window, 'gamepadconnected', syncLoop);
	useEventListener(() => window, 'gamepaddisconnected', syncLoop);

	$effect(() => {
		// Picks up a gamepad pressed before mount. Untracked: `resume()` reads its own `active`
		// state, so a tracked call would let a later `pause()` re-resume and never stop.
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

import { flushSync } from 'svelte';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { useGamepad } from './useGamepad.svelte.js';

/**
 * Headless Chromium has no controller attached and the Gamepad API cannot be
 * driven without CDP, so `navigator.getGamepads` is stubbed. `useSupported`
 * evaluates its probe immediately, so the stub goes in before construction.
 */

function pad(index: number, id = `Pad ${index}`): Gamepad {
	return {
		index,
		id,
		connected: true,
		mapping: 'standard',
		timestamp: 0,
		axes: [0, 0],
		buttons: [],
		vibrationActuator: null
	} as unknown as Gamepad;
}

/** Lets the rAF polling loop run at least one frame. */
async function frames(count = 2) {
	for (let i = 0; i < count; i++) {
		await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
	}
	flushSync();
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe('useGamepad', () => {
	test('reports support', () => {
		const cleanup = $effect.root(() => {
			expect(useGamepad().isSupported()).toBe(true);
		});
		cleanup();
	});

	test('is idle and polls nothing when no gamepad is connected', () => {
		vi.spyOn(navigator, 'getGamepads').mockReturnValue([]);

		let pads!: ReturnType<typeof useGamepad>;
		const cleanup = $effect.root(() => {
			pads = useGamepad();
		});
		flushSync();

		expect(pads.isConnected()).toBe(false);
		expect(pads.gamepads()).toEqual([]);
		// The whole point of gating the loop: an idle page does no per-frame work.
		expect(pads.isPolling()).toBe(false);

		cleanup();
	});

	test('compacts the null slots the API returns', () => {
		// getGamepads() returns a sparse list with nulls for empty slots.
		vi.spyOn(navigator, 'getGamepads').mockReturnValue([null, pad(1), null]);

		let pads!: ReturnType<typeof useGamepad>;
		const cleanup = $effect.root(() => {
			pads = useGamepad();
		});
		flushSync();

		expect(pads.gamepads()).toHaveLength(1);
		expect(pads.gamepads()[0].index).toBe(1);
		expect(pads.isConnected()).toBe(true);

		cleanup();
	});

	test('starts polling once a gamepad connects, and stops when it leaves', async () => {
		const getGamepads = vi.spyOn(navigator, 'getGamepads').mockReturnValue([]);

		let pads!: ReturnType<typeof useGamepad>;
		const cleanup = $effect.root(() => {
			pads = useGamepad();
		});
		flushSync();
		expect(pads.isPolling()).toBe(false);

		getGamepads.mockReturnValue([pad(0)]);
		window.dispatchEvent(new Event('gamepadconnected'));
		flushSync();

		expect(pads.isPolling()).toBe(true);
		expect(pads.isConnected()).toBe(true);

		getGamepads.mockReturnValue([]);
		window.dispatchEvent(new Event('gamepaddisconnected'));
		flushSync();

		expect(pads.isPolling()).toBe(false);
		expect(pads.isConnected()).toBe(false);

		cleanup();
	});

	test('refreshes state on each frame while polling', async () => {
		const first = pad(0);
		const getGamepads = vi.spyOn(navigator, 'getGamepads').mockReturnValue([first]);

		let pads!: ReturnType<typeof useGamepad>;
		const cleanup = $effect.root(() => {
			pads = useGamepad();
		});
		flushSync();
		expect(pads.isPolling()).toBe(true);

		// getGamepads returns fresh snapshots, not live objects, which is why
		// the array is replaced wholesale every frame.
		const updated = pad(0, 'Pad 0 moved');
		getGamepads.mockReturnValue([updated]);
		await frames();

		expect(pads.gamepads()[0].id).toBe('Pad 0 moved');

		cleanup();
	});

	test('pause() and resume() control the loop', async () => {
		vi.spyOn(navigator, 'getGamepads').mockReturnValue([pad(0)]);

		let pads!: ReturnType<typeof useGamepad>;
		const cleanup = $effect.root(() => {
			pads = useGamepad();
		});
		flushSync();
		expect(pads.isPolling()).toBe(true);

		pads.pause();
		flushSync();
		expect(pads.isPolling()).toBe(false);

		pads.resume();
		flushSync();
		expect(pads.isPolling()).toBe(true);

		cleanup();
	});

	test('reports unsupported when getGamepads is absent', () => {
		const original = navigator.getGamepads;
		Object.defineProperty(navigator, 'getGamepads', { value: undefined, configurable: true });

		try {
			let pads!: ReturnType<typeof useGamepad>;
			const cleanup = $effect.root(() => {
				pads = useGamepad();
			});
			flushSync();

			expect(pads.isSupported()).toBe(false);
			expect(pads.gamepads()).toEqual([]);

			cleanup();
		} finally {
			Object.defineProperty(navigator, 'getGamepads', { value: original, configurable: true });
		}
	});
});

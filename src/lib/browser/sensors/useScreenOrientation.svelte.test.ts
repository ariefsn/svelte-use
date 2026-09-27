import { flushSync } from 'svelte';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { useScreenOrientation } from './useScreenOrientation.svelte.js';

/**
 * `screen.orientation` is real in Chromium and reports the desktop window's orientation, so reads
 * are genuine.
 */

afterEach(() => {
	vi.restoreAllMocks();
});

describe('useScreenOrientation', () => {
	test('reports support and the current orientation', () => {
		let orientation!: ReturnType<typeof useScreenOrientation>;
		const cleanup = $effect.root(() => {
			orientation = useScreenOrientation();
		});
		flushSync();

		expect(orientation.isSupported()).toBe(true);
		expect(orientation.orientation()).toBe(screen.orientation.type);
		expect(orientation.angle()).toBe(screen.orientation.angle);

		cleanup();
	});

	test('updates on the change event', () => {
		let orientation!: ReturnType<typeof useScreenOrientation>;
		const cleanup = $effect.root(() => {
			orientation = useScreenOrientation();
		});
		flushSync();

		// The real screen cannot be rotated here, so the reported values are
		// faked and the event is dispatched as the browser would.
		vi.spyOn(screen.orientation, 'type', 'get').mockReturnValue('landscape-primary');
		vi.spyOn(screen.orientation, 'angle', 'get').mockReturnValue(90);

		screen.orientation.dispatchEvent(new Event('change'));
		flushSync();

		expect(orientation.orientation()).toBe('landscape-primary');
		expect(orientation.angle()).toBe(90);

		cleanup();
	});

	test('lock() rejects with NotSupportedError when the browser has no lock()', async () => {
		// Firefox and Safari ship no `lock()` at all. Stubbed rather than branched on the host browser,
		// so the assertion is deterministic — headless Chromium does implement it and resolves.
		const orientationStub = Object.assign(new EventTarget(), {
			type: 'portrait-primary',
			angle: 0,
			unlock: () => {}
		});
		vi.stubGlobal('screen', { orientation: orientationStub });

		try {
			let orientation!: ReturnType<typeof useScreenOrientation>;
			const cleanup = $effect.root(() => {
				orientation = useScreenOrientation();
			});
			flushSync();

			expect(orientation.isLockSupported()).toBe(false);
			await expect(orientation.lock('portrait')).rejects.toThrow(/not available/);

			cleanup();
		} finally {
			vi.unstubAllGlobals();
		}
	});

	test('isLockSupported reflects whether lock() exists', () => {
		let orientation!: ReturnType<typeof useScreenOrientation>;
		const cleanup = $effect.root(() => {
			orientation = useScreenOrientation();
		});
		flushSync();

		expect(orientation.isLockSupported()).toBe(
			typeof (screen.orientation as ScreenOrientation & { lock?: unknown }).lock === 'function'
		);

		cleanup();
	});

	test('unlock() is safe to call', () => {
		let orientation!: ReturnType<typeof useScreenOrientation>;
		const cleanup = $effect.root(() => {
			orientation = useScreenOrientation();
		});
		flushSync();

		expect(() => orientation.unlock()).not.toThrow();

		cleanup();
	});

	test('reports unsupported when screen.orientation is absent', () => {
		const original = Object.getOwnPropertyDescriptor(globalThis, 'screen');
		vi.stubGlobal('screen', {});

		try {
			let orientation!: ReturnType<typeof useScreenOrientation>;
			const cleanup = $effect.root(() => {
				orientation = useScreenOrientation();
			});
			flushSync();

			expect(orientation.isSupported()).toBe(false);
			expect(orientation.isLockSupported()).toBe(false);
			expect(orientation.orientation()).toBeNull();
			expect(orientation.angle()).toBe(0);

			cleanup();
		} finally {
			vi.unstubAllGlobals();
			if (original) Object.defineProperty(globalThis, 'screen', original);
		}
	});
});

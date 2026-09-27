import { flushSync } from 'svelte';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { useWakeLock } from './useWakeLock.svelte.js';

/** Hands out a sentinel whose `release` can be asserted on. */
function stubWakeLock() {
	const release = vi.fn(async () => {});
	const sentinel = { release, addEventListener: vi.fn() };
	vi.stubGlobal('navigator', {
		...navigator,
		wakeLock: { request: vi.fn(async () => sentinel) }
	});
	return { release };
}

describe('useWakeLock', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	test('detects support', () => {
		const cleanup = $effect.root(() => {
			const { isSupported } = useWakeLock();
			expect(typeof isSupported()).toBe('boolean');
		});
		cleanup();
	});

	test('starts inactive', () => {
		const cleanup = $effect.root(() => {
			const { isActive } = useWakeLock();
			expect(isActive()).toBe(false);
		});
		cleanup();
	});

	test('release does not throw when no lock', async () => {
		// useWakeLock() registers an $effect, so it must be constructed inside
		// the root — calling it outside throws effect_orphan.
		let release!: () => Promise<void>;
		const cleanup = $effect.root(() => {
			({ release } = useWakeLock());
		});
		await expect(release()).resolves.toBeUndefined();
		cleanup();
	});

	test('scope destroy releases a held lock', async () => {
		const { release } = stubWakeLock();
		let api!: ReturnType<typeof useWakeLock>;
		const cleanup = $effect.root(() => {
			api = useWakeLock();
		});
		flushSync();

		await api.request();
		expect(api.isActive()).toBe(true);

		cleanup();
		flushSync();
		expect(release).toHaveBeenCalledOnce();
	});

	test('an explicit release is not repeated on destroy', async () => {
		const { release } = stubWakeLock();
		let api!: ReturnType<typeof useWakeLock>;
		const cleanup = $effect.root(() => {
			api = useWakeLock();
		});
		flushSync();

		await api.request();
		await api.release();
		cleanup();
		flushSync();
		expect(release).toHaveBeenCalledOnce();
	});

	test('nothing is released when no lock was taken', () => {
		const { release } = stubWakeLock();
		const cleanup = $effect.root(() => {
			useWakeLock();
		});
		flushSync();
		cleanup();
		flushSync();
		expect(release).not.toHaveBeenCalled();
	});
});

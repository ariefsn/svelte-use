import { describe, expect, test } from 'vitest';
import { useWakeLock } from './useWakeLock.svelte.js';

describe('useWakeLock', () => {
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
		const cleanup = $effect.root(() => {});
		const { release } = useWakeLock();
		await expect(release()).resolves.toBeUndefined();
		cleanup();
	});
});

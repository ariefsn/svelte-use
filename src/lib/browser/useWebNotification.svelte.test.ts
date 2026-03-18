import { describe, expect, test } from 'vitest';
import { useWebNotification } from './useWebNotification.svelte.js';

describe('useWebNotification', () => {
	test('detects support', () => {
		const cleanup = $effect.root(() => {
			const { isSupported } = useWebNotification();
			expect(typeof isSupported()).toBe('boolean');
		});
		cleanup();
	});

	test('starts with no notification', () => {
		const cleanup = $effect.root(() => {
			const { notification } = useWebNotification({ autoRequestPermission: false });
			expect(notification()).toBeNull();
		});
		cleanup();
	});

	test('close does not throw when no notification', () => {
		const cleanup = $effect.root(() => {
			const { close } = useWebNotification({ autoRequestPermission: false });
			expect(() => close()).not.toThrow();
		});
		cleanup();
	});
});

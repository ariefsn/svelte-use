import { describe, expect, test } from 'vitest';
import { usePermission } from './usePermission.svelte.js';

describe('usePermission', () => {
	test('detects support', () => {
		const cleanup = $effect.root(() => {
			const { isSupported } = usePermission('camera');
			expect(typeof isSupported()).toBe('boolean');
		});
		cleanup();
	});

	test('starts with undefined state', () => {
		const cleanup = $effect.root(() => {
			const { state } = usePermission('camera');
			expect(state()).toBeUndefined();
		});
		cleanup();
	});
});

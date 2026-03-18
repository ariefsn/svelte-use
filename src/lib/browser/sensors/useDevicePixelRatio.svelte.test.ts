import { describe, expect, test } from 'vitest';
import { useDevicePixelRatio } from './useDevicePixelRatio.svelte.js';

describe('useDevicePixelRatio', () => {
	test('detects support', () => {
		const cleanup = $effect.root(() => {
			const { isSupported } = useDevicePixelRatio();
			expect(typeof isSupported()).toBe('boolean');
		});
		cleanup();
	});

	test('returns a number', () => {
		const cleanup = $effect.root(() => {
			const { current } = useDevicePixelRatio();
			expect(typeof current()).toBe('number');
			expect(current()).toBeGreaterThan(0);
		});
		cleanup();
	});
});

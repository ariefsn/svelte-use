import { describe, expect, test } from 'vitest';
import { useDeviceOrientation } from './useDeviceOrientation.svelte.js';

describe('useDeviceOrientation', () => {
	test('detects support', () => {
		const cleanup = $effect.root(() => {
			const { isSupported } = useDeviceOrientation();
			expect(typeof isSupported()).toBe('boolean');
		});
		cleanup();
	});

	test('starts with null values', () => {
		const cleanup = $effect.root(() => {
			const { alpha, beta, gamma } = useDeviceOrientation();
			expect(alpha()).toBeNull();
			expect(beta()).toBeNull();
			expect(gamma()).toBeNull();
		});
		cleanup();
	});

	test('starts with isAbsolute false', () => {
		const cleanup = $effect.root(() => {
			const { isAbsolute } = useDeviceOrientation();
			expect(isAbsolute()).toBe(false);
		});
		cleanup();
	});
});

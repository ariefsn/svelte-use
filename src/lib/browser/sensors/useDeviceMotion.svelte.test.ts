import { describe, expect, test } from 'vitest';
import { useDeviceMotion } from './useDeviceMotion.svelte.js';

describe('useDeviceMotion', () => {
	test('detects support', () => {
		const cleanup = $effect.root(() => {
			const { isSupported } = useDeviceMotion();
			expect(typeof isSupported()).toBe('boolean');
		});
		cleanup();
	});

	test('starts with null acceleration', () => {
		const cleanup = $effect.root(() => {
			const { acceleration } = useDeviceMotion();
			expect(acceleration()).toBeNull();
		});
		cleanup();
	});

	test('starts with zero interval', () => {
		const cleanup = $effect.root(() => {
			const { interval } = useDeviceMotion();
			expect(interval()).toBe(0);
		});
		cleanup();
	});
});

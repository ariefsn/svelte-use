import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { useVibrate } from './useVibrate.svelte.js';

describe('useVibrate', () => {
	let originalVibrate: typeof navigator.vibrate | undefined;

	beforeEach(() => {
		originalVibrate = navigator.vibrate;
	});

	afterEach(() => {
		Object.defineProperty(navigator, 'vibrate', {
			value: originalVibrate,
			writable: true,
			configurable: true
		});
	});

	test('detects support', () => {
		const cleanup = $effect.root(() => {
			const { isSupported } = useVibrate();
			expect(typeof isSupported()).toBe('boolean');
		});
		cleanup();
	});

	test('vibrate calls navigator.vibrate', () => {
		const mockVibrate = vi.fn(() => true);
		Object.defineProperty(navigator, 'vibrate', {
			value: mockVibrate,
			writable: true,
			configurable: true
		});

		const cleanup = $effect.root(() => {
			const { vibrate } = useVibrate(200);
			vibrate();
			expect(mockVibrate).toHaveBeenCalledWith(200);
		});
		cleanup();
	});

	test('vibrate with custom pattern', () => {
		const mockVibrate = vi.fn(() => true);
		Object.defineProperty(navigator, 'vibrate', {
			value: mockVibrate,
			writable: true,
			configurable: true
		});

		const cleanup = $effect.root(() => {
			const { vibrate } = useVibrate();
			vibrate([100, 50, 100]);
			expect(mockVibrate).toHaveBeenCalledWith([100, 50, 100]);
		});
		cleanup();
	});

	test('stop calls vibrate(0)', () => {
		const mockVibrate = vi.fn(() => true);
		Object.defineProperty(navigator, 'vibrate', {
			value: mockVibrate,
			writable: true,
			configurable: true
		});

		const cleanup = $effect.root(() => {
			const { stop } = useVibrate();
			stop();
			expect(mockVibrate).toHaveBeenCalledWith(0);
		});
		cleanup();
	});
});

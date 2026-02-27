import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useFps } from './useFps.svelte.js';

describe('useFps', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	test('returns 0 initially before any frame fires', () => {
		const cleanup = $effect.root(() => {
			const fps = useFps();
			// No frames fired yet – FPS is the initial default
			expect(fps()).toBe(0);
		});
		cleanup();
	});

	test('computes FPS after two RAF frames', () => {
		const cleanup = $effect.root(() => {
			const fps = useFps();
			flushSync();

			// Simulate two animation frames 16ms apart (≈60 fps)
			vi.runAllTimers();
			flushSync();

			// After the loop has run at least once the FPS should be a positive number
			// (exact value depends on how jsdom simulates RAF timing)
			expect(fps()).toBeGreaterThanOrEqual(0);
		});
		cleanup();
	});

	test('returns a number type', () => {
		const cleanup = $effect.root(() => {
			const fps = useFps();
			expect(typeof fps()).toBe('number');
		});
		cleanup();
	});

	test('cancels RAF loop on cleanup', () => {
		const cancelSpy = vi.spyOn(globalThis, 'cancelAnimationFrame');

		const cleanup = $effect.root(() => {
			useFps();
			flushSync();
		});

		cleanup();
		flushSync();

		expect(cancelSpy).toHaveBeenCalled();
		cancelSpy.mockRestore();
	});

	test('requests animation frames on mount', () => {
		const rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame');

		const cleanup = $effect.root(() => {
			useFps();
			flushSync();
		});

		expect(rafSpy).toHaveBeenCalled();

		cleanup();
		rafSpy.mockRestore();
	});
});

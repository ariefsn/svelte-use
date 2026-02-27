import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { useCountdown } from './useCountdown.svelte.js';

describe('useCountdown', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	test('initialises with given count and inactive state', () => {
		const cleanup = $effect.root(() => {
			const { count, isActive } = useCountdown(10);
			expect(count()).toBe(10);
			expect(isActive()).toBe(false);
		});
		cleanup();
	});

	test('start() activates the countdown', () => {
		const cleanup = $effect.root(() => {
			const { isActive, start } = useCountdown(5);
			start();
			expect(isActive()).toBe(true);
		});
		cleanup();
	});

	test('decrements by 1 every interval', () => {
		const cleanup = $effect.root(() => {
			const { count, start } = useCountdown(5, 1000);
			start();

			vi.advanceTimersByTime(1000);
			expect(count()).toBe(4);

			vi.advanceTimersByTime(1000);
			expect(count()).toBe(3);
		});
		cleanup();
	});

	test('stops automatically at zero', () => {
		const cleanup = $effect.root(() => {
			const { count, isActive, start } = useCountdown(3, 1000);
			start();

			vi.advanceTimersByTime(3000);
			expect(count()).toBe(0);
			expect(isActive()).toBe(false);
		});
		cleanup();
	});

	test('count never goes below zero', () => {
		const cleanup = $effect.root(() => {
			const { count, start } = useCountdown(2, 1000);
			start();

			vi.advanceTimersByTime(10_000);
			expect(count()).toBe(0);
		});
		cleanup();
	});

	test('stop() halts the countdown before zero', () => {
		const cleanup = $effect.root(() => {
			const { count, isActive, start, stop } = useCountdown(10, 1000);
			start();

			vi.advanceTimersByTime(3000);
			stop();
			expect(isActive()).toBe(false);

			vi.advanceTimersByTime(3000);
			expect(count()).toBe(7);
		});
		cleanup();
	});

	test('reset() restores initial count and stops', () => {
		const cleanup = $effect.root(() => {
			const { count, isActive, start, reset } = useCountdown(5, 1000);
			start();

			vi.advanceTimersByTime(2000);
			expect(count()).toBe(3);

			reset();
			expect(count()).toBe(5);
			expect(isActive()).toBe(false);
		});
		cleanup();
	});

	test('start() is a no-op when already active', () => {
		const cleanup = $effect.root(() => {
			const { isActive, start } = useCountdown(5, 1000);
			start();
			start();
			expect(isActive()).toBe(true);
		});
		cleanup();
	});

	test('start() is a no-op when count is already 0', () => {
		const cleanup = $effect.root(() => {
			const { count, isActive, start } = useCountdown(0, 1000);
			start();
			expect(isActive()).toBe(false);
			expect(count()).toBe(0);
		});
		cleanup();
	});

	test('can restart after reset()', () => {
		const cleanup = $effect.root(() => {
			const { count, isActive, start, reset } = useCountdown(3, 1000);
			start();

			vi.advanceTimersByTime(3000);
			expect(count()).toBe(0);
			expect(isActive()).toBe(false);

			reset();
			start();
			expect(isActive()).toBe(true);

			vi.advanceTimersByTime(1000);
			expect(count()).toBe(2);
		});
		cleanup();
	});

	test('cleans up interval on effect teardown', () => {
		const clearSpy = vi.spyOn(globalThis, 'clearInterval');

		const cleanup = $effect.root(() => {
			const { start } = useCountdown(10, 1000);
			start();
		});

		cleanup();
		expect(clearSpy).toHaveBeenCalled();
		clearSpy.mockRestore();
	});

	test('uses custom interval duration', () => {
		const cleanup = $effect.root(() => {
			const { count, start } = useCountdown(5, 500);
			start();

			vi.advanceTimersByTime(500);
			expect(count()).toBe(4);

			vi.advanceTimersByTime(500);
			expect(count()).toBe(3);
		});
		cleanup();
	});
});

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useThrottleFn } from './useThrottleFn.svelte.js';

describe('useThrottleFn', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	test('calls the function immediately on the first invocation', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn();
			const throttled = useThrottleFn(fn, 200);

			throttled();
			expect(fn).toHaveBeenCalledTimes(1);
		});
		cleanup();
	});

	test('does not call the function again within the delay window', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn();
			const throttled = useThrottleFn(fn, 200);

			throttled();
			throttled();
			throttled();

			// First call fires immediately, subsequent calls are throttled
			expect(fn).toHaveBeenCalledTimes(1);
		});
		cleanup();
	});

	test('calls the function again after the delay has elapsed', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn();
			const throttled = useThrottleFn(fn, 200);

			throttled();
			vi.advanceTimersByTime(200);
			throttled();

			expect(fn).toHaveBeenCalledTimes(2);
		});
		cleanup();
	});

	test('forwards arguments correctly', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn();
			const throttled = useThrottleFn(fn, 100);

			throttled('hello', 42);
			expect(fn).toHaveBeenCalledWith('hello', 42);
		});
		cleanup();
	});

	test('returns the original function return value on immediate calls', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn(() => 99);
			const throttled = useThrottleFn(fn, 100);

			const result = throttled();
			expect(result).toBe(99);
		});
		cleanup();
	});

	test('cleans up pending timers on scope destroy', () => {
		const fn = vi.fn();
		const cleanup = $effect.root(() => {
			const throttled = useThrottleFn(fn, 200);

			throttled();
			vi.advanceTimersByTime(100);
			throttled(); // schedules trailing call
		});

		cleanup(); // destroys scope and clears timer

		// Advance time past the delay – trailing call should NOT fire after cleanup
		vi.advanceTimersByTime(200);
		// fn was called once on the first immediate invocation
		expect(fn).toHaveBeenCalledTimes(1);
	});

	test('preserves argument types through inference', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn((a: number, b: string) => `${a}-${b}`);
			const throttled = useThrottleFn(fn, 50);

			throttled(1, 'a');
			expect(fn).toHaveBeenCalledWith(1, 'a');
		});
		cleanup();
	});
});

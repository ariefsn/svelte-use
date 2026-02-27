import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useDebounceFn } from './useDebounceFn.svelte.js';

describe('useDebounceFn', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	test('does not call the function before the delay elapses', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn();
			const debounced = useDebounceFn(fn, 300);

			debounced();
			vi.advanceTimersByTime(299);

			expect(fn).not.toHaveBeenCalled();
		});
		cleanup();
	});

	test('calls the function after the delay elapses', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn();
			const debounced = useDebounceFn(fn, 300);

			debounced();
			vi.advanceTimersByTime(300);

			expect(fn).toHaveBeenCalledTimes(1);
		});
		cleanup();
	});

	test('resets the timer on rapid successive calls', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn();
			const debounced = useDebounceFn(fn, 300);

			debounced();
			vi.advanceTimersByTime(200);
			debounced(); // resets timer
			vi.advanceTimersByTime(200);

			// Only 200ms since last call – should not fire yet
			expect(fn).not.toHaveBeenCalled();

			vi.advanceTimersByTime(100);
			expect(fn).toHaveBeenCalledTimes(1);
		});
		cleanup();
	});

	test('calls the function only once after multiple rapid calls', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn();
			const debounced = useDebounceFn(fn, 100);

			debounced();
			debounced();
			debounced();
			vi.advanceTimersByTime(100);

			expect(fn).toHaveBeenCalledTimes(1);
		});
		cleanup();
	});

	test('forwards arguments to the underlying function', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn();
			const debounced = useDebounceFn(fn, 100);

			debounced('hello', 42);
			vi.advanceTimersByTime(100);

			expect(fn).toHaveBeenCalledWith('hello', 42);
		});
		cleanup();
	});

	test('cleans up pending timer on scope destroy', () => {
		const fn = vi.fn();
		const cleanup = $effect.root(() => {
			const debounced = useDebounceFn(fn, 300);
			debounced();
		});

		cleanup(); // destroys scope – timer should be cleared

		vi.advanceTimersByTime(300);
		expect(fn).not.toHaveBeenCalled();
	});

	test('preserves typed arguments', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn((a: number, b: string) => `${a}-${b}`);
			const debounced = useDebounceFn(fn, 50);

			debounced(7, 'test');
			vi.advanceTimersByTime(50);

			expect(fn).toHaveBeenCalledWith(7, 'test');
		});
		cleanup();
	});
});

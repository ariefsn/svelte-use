import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useTimeoutFn } from './useTimeoutFn.svelte.js';

describe('useTimeoutFn', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	test('does not start automatically', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn();
			const { isPending } = useTimeoutFn(fn, 500);
			expect(isPending()).toBe(false);
			vi.advanceTimersByTime(500);
			expect(fn).not.toHaveBeenCalled();
		});
		cleanup();
	});

	test('start() arms the timeout and sets isPending to true', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn();
			const { start, isPending } = useTimeoutFn(fn, 500);
			start();
			expect(isPending()).toBe(true);
		});
		cleanup();
	});

	test('fires fn after delay and clears isPending', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn();
			const { start, isPending } = useTimeoutFn(fn, 300);
			start();
			vi.advanceTimersByTime(300);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(isPending()).toBe(false);
		});
		cleanup();
	});

	test('does not fire before delay elapses', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn();
			const { start } = useTimeoutFn(fn, 300);
			start();
			vi.advanceTimersByTime(299);
			expect(fn).not.toHaveBeenCalled();
		});
		cleanup();
	});

	test('stop() cancels a running timeout', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn();
			const { start, stop, isPending } = useTimeoutFn(fn, 500);
			start();
			expect(isPending()).toBe(true);
			stop();
			expect(isPending()).toBe(false);
			vi.advanceTimersByTime(500);
			expect(fn).not.toHaveBeenCalled();
		});
		cleanup();
	});

	test('stop() is a no-op when not running', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn();
			const { stop, isPending } = useTimeoutFn(fn, 500);
			expect(() => stop()).not.toThrow();
			expect(isPending()).toBe(false);
		});
		cleanup();
	});

	test('start() can be called again after fn fires', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn();
			const { start, isPending } = useTimeoutFn(fn, 200);
			start();
			vi.advanceTimersByTime(200);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(isPending()).toBe(false);

			start();
			expect(isPending()).toBe(true);
			vi.advanceTimersByTime(200);
			expect(fn).toHaveBeenCalledTimes(2);
		});
		cleanup();
	});

	test('calling start() again resets the timer', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn();
			const { start } = useTimeoutFn(fn, 300);
			start();
			vi.advanceTimersByTime(200);
			start(); // resets the timer
			vi.advanceTimersByTime(200); // only 200ms into reset timer
			expect(fn).not.toHaveBeenCalled();
			vi.advanceTimersByTime(100); // 300ms since last start()
			expect(fn).toHaveBeenCalledTimes(1);
		});
		cleanup();
	});

	test('cleanup on destroy cancels pending timeout', () => {
		const fn = vi.fn();
		const cleanup = $effect.root(() => {
			const { start } = useTimeoutFn(fn, 500);
			start();
			flushSync();
		});

		cleanup();
		vi.advanceTimersByTime(500);
		expect(fn).not.toHaveBeenCalled();
	});

	test('fn is called at most once per start()', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn();
			const { start } = useTimeoutFn(fn, 100);
			start();
			vi.advanceTimersByTime(1000);
			expect(fn).toHaveBeenCalledTimes(1);
		});
		cleanup();
	});
});

import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useIntervalFn } from './useIntervalFn.svelte.js';

describe('useIntervalFn', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	test('does not start automatically', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn();
			const { isActive } = useIntervalFn(fn, 200);
			expect(isActive()).toBe(false);
			vi.advanceTimersByTime(600);
			expect(fn).not.toHaveBeenCalled();
		});
		cleanup();
	});

	test('resume() starts the interval and sets isActive to true', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn();
			const { resume, isActive } = useIntervalFn(fn, 200);
			resume();
			expect(isActive()).toBe(true);
			vi.advanceTimersByTime(200);
			expect(fn).toHaveBeenCalledTimes(1);
		});
		cleanup();
	});

	test('invokes fn repeatedly at the given interval', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn();
			const { resume } = useIntervalFn(fn, 200);
			resume();
			vi.advanceTimersByTime(600);
			expect(fn).toHaveBeenCalledTimes(3);
		});
		cleanup();
	});

	test('pause() stops invocations and sets isActive to false', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn();
			const { resume, pause, isActive } = useIntervalFn(fn, 200);
			resume();
			vi.advanceTimersByTime(200);
			expect(fn).toHaveBeenCalledTimes(1);
			pause();
			expect(isActive()).toBe(false);
			vi.advanceTimersByTime(600);
			expect(fn).toHaveBeenCalledTimes(1);
		});
		cleanup();
	});

	test('pause() is a no-op when not running', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn();
			const { pause, isActive } = useIntervalFn(fn, 200);
			expect(() => pause()).not.toThrow();
			expect(isActive()).toBe(false);
		});
		cleanup();
	});

	test('resume() is a no-op when already active', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn();
			const { resume, isActive } = useIntervalFn(fn, 200);
			resume();
			resume(); // second call should not create a second interval
			vi.advanceTimersByTime(200);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(isActive()).toBe(true);
		});
		cleanup();
	});

	test('pause() and resume() can be called multiple times', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn();
			const { resume, pause } = useIntervalFn(fn, 200);
			resume();
			vi.advanceTimersByTime(200);
			expect(fn).toHaveBeenCalledTimes(1);

			pause();
			vi.advanceTimersByTime(400);
			expect(fn).toHaveBeenCalledTimes(1);

			resume();
			vi.advanceTimersByTime(200);
			expect(fn).toHaveBeenCalledTimes(2);
		});
		cleanup();
	});

	test('cleanup on destroy stops the interval', () => {
		const fn = vi.fn();
		const cleanup = $effect.root(() => {
			const { resume } = useIntervalFn(fn, 200);
			resume();
			flushSync();
		});

		cleanup();
		vi.advanceTimersByTime(600);
		expect(fn).not.toHaveBeenCalled();
	});
});

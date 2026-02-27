import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useTimeoutPoll } from './useTimeoutPoll.svelte.js';

describe('useTimeoutPoll', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	test('does not start automatically', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn();
			const { isActive } = useTimeoutPoll(fn, 300);
			expect(isActive()).toBe(false);
			vi.advanceTimersByTime(600);
			expect(fn).not.toHaveBeenCalled();
		});
		cleanup();
	});

	test('start() sets isActive to true', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn();
			const { start, isActive } = useTimeoutPoll(fn, 300);
			start();
			expect(isActive()).toBe(true);
		});
		cleanup();
	});

	test('invokes fn after the interval elapses', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn();
			const { start } = useTimeoutPoll(fn, 300);
			start();
			vi.advanceTimersByTime(300);
			expect(fn).toHaveBeenCalledTimes(1);
		});
		cleanup();
	});

	test('does not invoke fn before interval elapses', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn();
			const { start } = useTimeoutPoll(fn, 300);
			start();
			vi.advanceTimersByTime(299);
			expect(fn).not.toHaveBeenCalled();
		});
		cleanup();
	});

	test('chains calls repeatedly', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn();
			const { start } = useTimeoutPoll(fn, 200);
			start();
			vi.advanceTimersByTime(200);
			expect(fn).toHaveBeenCalledTimes(1);
			vi.advanceTimersByTime(200);
			expect(fn).toHaveBeenCalledTimes(2);
			vi.advanceTimersByTime(200);
			expect(fn).toHaveBeenCalledTimes(3);
		});
		cleanup();
	});

	test('stop() cancels pending timeout', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn();
			const { start, stop, isActive } = useTimeoutPoll(fn, 300);
			start();
			vi.advanceTimersByTime(150); // halfway through first interval
			stop();
			expect(isActive()).toBe(false);
			vi.advanceTimersByTime(300); // would have fired by now
			expect(fn).not.toHaveBeenCalled();
		});
		cleanup();
	});

	test('stop() stops further chained calls', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn();
			const { start, stop } = useTimeoutPoll(fn, 200);
			start();
			vi.advanceTimersByTime(200);
			expect(fn).toHaveBeenCalledTimes(1);
			stop();
			vi.advanceTimersByTime(600);
			expect(fn).toHaveBeenCalledTimes(1);
		});
		cleanup();
	});

	test('start() is a no-op when already active', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn();
			const { start } = useTimeoutPoll(fn, 200);
			start();
			start(); // second call should not add a second chain
			vi.advanceTimersByTime(200);
			expect(fn).toHaveBeenCalledTimes(1);
		});
		cleanup();
	});

	test('can be restarted after stop()', () => {
		const cleanup = $effect.root(() => {
			const fn = vi.fn();
			const { start, stop, isActive } = useTimeoutPoll(fn, 200);
			start();
			vi.advanceTimersByTime(200);
			expect(fn).toHaveBeenCalledTimes(1);
			stop();
			expect(isActive()).toBe(false);
			start();
			expect(isActive()).toBe(true);
			vi.advanceTimersByTime(200);
			expect(fn).toHaveBeenCalledTimes(2);
		});
		cleanup();
	});

	test('cleanup on destroy stops polling', () => {
		const fn = vi.fn();
		const cleanup = $effect.root(() => {
			const { start } = useTimeoutPoll(fn, 200);
			start();
			flushSync();
		});

		cleanup();
		vi.advanceTimersByTime(600);
		expect(fn).not.toHaveBeenCalled();
	});
});

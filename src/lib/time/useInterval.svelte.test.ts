import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useInterval } from './useInterval.svelte.js';

describe('useInterval', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	test('starts active immediately by default', () => {
		const cleanup = $effect.root(() => {
			const cb = vi.fn();
			const { isActive } = useInterval(cb, () => 500);
			flushSync();
			expect(isActive()).toBe(true);
		});
		cleanup();
	});

	test('invokes callback repeatedly at the given interval', () => {
		const cleanup = $effect.root(() => {
			const cb = vi.fn();
			useInterval(cb, () => 200);
			flushSync();
			vi.advanceTimersByTime(200);
			expect(cb).toHaveBeenCalledTimes(1);
			vi.advanceTimersByTime(200);
			expect(cb).toHaveBeenCalledTimes(2);
			vi.advanceTimersByTime(200);
			expect(cb).toHaveBeenCalledTimes(3);
		});
		cleanup();
	});

	test('pause() stops callback invocations', () => {
		const cleanup = $effect.root(() => {
			const cb = vi.fn();
			const { pause, isActive } = useInterval(cb, () => 200);
			flushSync();
			vi.advanceTimersByTime(200);
			expect(cb).toHaveBeenCalledTimes(1);
			pause();
			expect(isActive()).toBe(false);
			vi.advanceTimersByTime(600);
			expect(cb).toHaveBeenCalledTimes(1);
		});
		cleanup();
	});

	test('resume() restarts the interval after pause()', () => {
		const cleanup = $effect.root(() => {
			const cb = vi.fn();
			const { pause, resume, isActive } = useInterval(cb, () => 200);
			flushSync();
			pause();
			expect(isActive()).toBe(false);
			resume();
			expect(isActive()).toBe(true);
			vi.advanceTimersByTime(200);
			expect(cb).toHaveBeenCalledTimes(1);
		});
		cleanup();
	});

	test('resume() is a no-op when already active', () => {
		const cleanup = $effect.root(() => {
			const cb = vi.fn();
			const { resume, isActive } = useInterval(cb, () => 200);
			flushSync();
			expect(isActive()).toBe(true);
			resume(); // should not create a second interval
			vi.advanceTimersByTime(200);
			expect(cb).toHaveBeenCalledTimes(1);
		});
		cleanup();
	});

	test('immediate: false does not start automatically', () => {
		const cleanup = $effect.root(() => {
			const cb = vi.fn();
			const { isActive } = useInterval(cb, () => 200, { immediate: false });
			flushSync();
			expect(isActive()).toBe(false);
			vi.advanceTimersByTime(600);
			expect(cb).not.toHaveBeenCalled();
		});
		cleanup();
	});

	test('immediate: false allows manual resume', () => {
		const cleanup = $effect.root(() => {
			const cb = vi.fn();
			const { resume, isActive } = useInterval(cb, () => 200, { immediate: false });
			flushSync();
			expect(isActive()).toBe(false);
			resume();
			expect(isActive()).toBe(true);
			vi.advanceTimersByTime(200);
			expect(cb).toHaveBeenCalledTimes(1);
		});
		cleanup();
	});

	test('restarts with new interval when delay changes', () => {
		const cleanup = $effect.root(() => {
			let d = $state(500);
			const cb = vi.fn();
			useInterval(cb, () => d);

			flushSync();
			vi.advanceTimersByTime(500);
			expect(cb).toHaveBeenCalledTimes(1);

			d = 200;
			flushSync(); // reactive delay change → new interval
			vi.advanceTimersByTime(200);
			expect(cb).toHaveBeenCalledTimes(2);
			vi.advanceTimersByTime(200);
			expect(cb).toHaveBeenCalledTimes(3);
		});
		cleanup();
	});

	test('cleanup on destroy stops the interval', () => {
		const cb = vi.fn();
		const cleanup = $effect.root(() => {
			useInterval(cb, () => 200);
			flushSync();
		});

		cleanup();
		vi.advanceTimersByTime(600);
		expect(cb).not.toHaveBeenCalled();
	});

	test('SSR safe: no error when window is undefined', () => {
		const cleanup = $effect.root(() => {
			expect(() => {
				useInterval(() => {}, () => 500);
			}).not.toThrow();
		});
		cleanup();
	});
});

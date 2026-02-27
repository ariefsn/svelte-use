import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useTimeout } from './useTimeout.svelte.js';

describe('useTimeout', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	test('starts pending immediately by default', () => {
		const cleanup = $effect.root(() => {
			const cb = vi.fn();
			const { isPending } = useTimeout(cb, () => 500);
			flushSync();
			expect(isPending()).toBe(true);
		});
		cleanup();
	});

	test('fires callback after delay and clears pending', () => {
		const cleanup = $effect.root(() => {
			const cb = vi.fn();
			const { isPending } = useTimeout(cb, () => 500);
			flushSync();
			vi.advanceTimersByTime(500);
			expect(cb).toHaveBeenCalledTimes(1);
			expect(isPending()).toBe(false);
		});
		cleanup();
	});

	test('does not fire before delay elapses', () => {
		const cleanup = $effect.root(() => {
			const cb = vi.fn();
			useTimeout(cb, () => 500);
			flushSync();
			vi.advanceTimersByTime(499);
			expect(cb).not.toHaveBeenCalled();
		});
		cleanup();
	});

	test('stop() cancels a pending timeout', () => {
		const cleanup = $effect.root(() => {
			const cb = vi.fn();
			const { isPending, stop } = useTimeout(cb, () => 500);
			flushSync();
			expect(isPending()).toBe(true);
			stop();
			expect(isPending()).toBe(false);
			vi.advanceTimersByTime(500);
			expect(cb).not.toHaveBeenCalled();
		});
		cleanup();
	});

	test('start() reschedules after stop()', () => {
		const cleanup = $effect.root(() => {
			const cb = vi.fn();
			const { start, stop, isPending } = useTimeout(cb, () => 300);
			flushSync();
			stop();
			expect(isPending()).toBe(false);
			start();
			expect(isPending()).toBe(true);
			vi.advanceTimersByTime(300);
			expect(cb).toHaveBeenCalledTimes(1);
		});
		cleanup();
	});

	test('immediate: false does not start automatically', () => {
		const cleanup = $effect.root(() => {
			const cb = vi.fn();
			const { isPending } = useTimeout(cb, () => 500, { immediate: false });
			flushSync();
			expect(isPending()).toBe(false);
			vi.advanceTimersByTime(500);
			expect(cb).not.toHaveBeenCalled();
		});
		cleanup();
	});

	test('immediate: false allows manual start', () => {
		const cleanup = $effect.root(() => {
			const cb = vi.fn();
			const { start, isPending } = useTimeout(cb, () => 300, { immediate: false });
			flushSync();
			expect(isPending()).toBe(false);
			start();
			expect(isPending()).toBe(true);
			vi.advanceTimersByTime(300);
			expect(cb).toHaveBeenCalledTimes(1);
			expect(isPending()).toBe(false);
		});
		cleanup();
	});

	test('reschedules when delay changes', () => {
		const cleanup = $effect.root(() => {
			let d = $state(500);
			const cb = vi.fn();
			const { isPending } = useTimeout(cb, () => d);

			flushSync();
			vi.advanceTimersByTime(300); // 300ms into 500ms timer

			d = 200; // reactive delay change → reschedule
			flushSync();

			vi.advanceTimersByTime(199); // 199ms into new 200ms timer
			expect(cb).not.toHaveBeenCalled();

			vi.advanceTimersByTime(1); // fires at exactly 200ms
			expect(cb).toHaveBeenCalledTimes(1);
			expect(isPending()).toBe(false);
		});
		cleanup();
	});

	test('cleanup on destroy cancels pending timeout', () => {
		const cb = vi.fn();
		let isPending!: () => boolean;

		const cleanup = $effect.root(() => {
			const t = useTimeout(cb, () => 500);
			isPending = t.isPending;
			flushSync();
		});

		// Destroy the root before the timer fires
		cleanup();
		vi.advanceTimersByTime(500);
		expect(cb).not.toHaveBeenCalled();
	});

	test('callback is not called more than once', () => {
		const cleanup = $effect.root(() => {
			const cb = vi.fn();
			useTimeout(cb, () => 100);
			flushSync();
			vi.advanceTimersByTime(1000);
			expect(cb).toHaveBeenCalledTimes(1);
		});
		cleanup();
	});

	test('SSR safe: no error when window is undefined', () => {
		const cleanup = $effect.root(() => {
			expect(() => {
				useTimeout(
					() => {},
					() => 500
				);
			}).not.toThrow();
		});
		cleanup();
	});
});

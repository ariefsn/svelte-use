import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useIdle } from './useIdle.svelte.js';

describe('useIdle', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	test('returns false initially (user is active)', () => {
		const cleanup = $effect.root(() => {
			const isIdle = useIdle(1000);
			expect(isIdle()).toBe(false);
		});
		cleanup();
	});

	test('returns true after timeout elapses with no activity', () => {
		const cleanup = $effect.root(() => {
			const isIdle = useIdle(1000);
			flushSync();

			expect(isIdle()).toBe(false);
			vi.advanceTimersByTime(1000);
			flushSync();

			expect(isIdle()).toBe(true);
		});
		cleanup();
	});

	test('resets to false when a tracked event fires', () => {
		const cleanup = $effect.root(() => {
			const isIdle = useIdle(1000);
			flushSync();

			vi.advanceTimersByTime(1000);
			flushSync();
			expect(isIdle()).toBe(true);

			window.dispatchEvent(new Event('mousemove'));
			flushSync();
			expect(isIdle()).toBe(false);
		});
		cleanup();
	});

	test('resets the timer when activity fires before timeout', () => {
		const cleanup = $effect.root(() => {
			const isIdle = useIdle(1000);
			flushSync();

			vi.advanceTimersByTime(600);
			window.dispatchEvent(new Event('keydown'));
			flushSync();

			// Only 600ms after last activity – not yet idle
			vi.advanceTimersByTime(600);
			flushSync();
			expect(isIdle()).toBe(false);

			// Now 1200ms after last activity – should be idle
			vi.advanceTimersByTime(500);
			flushSync();
			expect(isIdle()).toBe(true);
		});
		cleanup();
	});

	test('mousedown event resets the timer', () => {
		const cleanup = $effect.root(() => {
			const isIdle = useIdle(500);
			flushSync();

			vi.advanceTimersByTime(500);
			flushSync();
			expect(isIdle()).toBe(true);

			window.dispatchEvent(new Event('mousedown'));
			flushSync();
			expect(isIdle()).toBe(false);
		});
		cleanup();
	});

	test('touchstart event resets the timer', () => {
		const cleanup = $effect.root(() => {
			const isIdle = useIdle(500);
			flushSync();

			vi.advanceTimersByTime(500);
			flushSync();
			expect(isIdle()).toBe(true);

			window.dispatchEvent(new Event('touchstart'));
			flushSync();
			expect(isIdle()).toBe(false);
		});
		cleanup();
	});

	test('uses a custom timeout', () => {
		const cleanup = $effect.root(() => {
			const isIdle = useIdle(2000);
			flushSync();

			vi.advanceTimersByTime(1999);
			flushSync();
			expect(isIdle()).toBe(false);

			vi.advanceTimersByTime(1);
			flushSync();
			expect(isIdle()).toBe(true);
		});
		cleanup();
	});

	test('cleanup removes event listeners', () => {
		const addSpy = vi.spyOn(window, 'addEventListener');
		const removeSpy = vi.spyOn(window, 'removeEventListener');

		const cleanup = $effect.root(() => {
			useIdle(1000);
			flushSync();
		});

		cleanup();
		flushSync();

		expect(addSpy.mock.calls.some(([e]) => e === 'mousemove')).toBe(true);
		expect(removeSpy.mock.calls.some(([e]) => e === 'mousemove')).toBe(true);

		addSpy.mockRestore();
		removeSpy.mockRestore();
	});

	test('does not throw after cleanup when timer fires', () => {
		const cleanup = $effect.root(() => {
			useIdle(500);
			flushSync();
		});

		cleanup();
		flushSync();

		// Should not throw
		vi.advanceTimersByTime(1000);
	});
});

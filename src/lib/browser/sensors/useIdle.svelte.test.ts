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

	test('isIdle starts as false', () => {
		const cleanup = $effect.root(() => {
			const { isIdle } = useIdle(1000);
			expect(isIdle()).toBe(false);
		});
		cleanup();
	});

	test('isIdle becomes true after timeout elapses', () => {
		const cleanup = $effect.root(() => {
			const { isIdle } = useIdle(1000);
			flushSync();

			expect(isIdle()).toBe(false);
			vi.advanceTimersByTime(1000);
			flushSync();

			expect(isIdle()).toBe(true);
		});
		cleanup();
	});

	test('isIdle resets to false when user activity occurs', () => {
		const cleanup = $effect.root(() => {
			const { isIdle } = useIdle(1000);
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

	test('timer resets when activity occurs before timeout', () => {
		const cleanup = $effect.root(() => {
			const { isIdle } = useIdle(1000);
			flushSync();

			vi.advanceTimersByTime(500);
			window.dispatchEvent(new Event('keydown'));
			flushSync();

			vi.advanceTimersByTime(600);
			flushSync();
			// 600ms after activity, not yet idle (needs 1000ms)
			expect(isIdle()).toBe(false);

			vi.advanceTimersByTime(500);
			flushSync();
			// Now 1100ms total after activity - should be idle
			expect(isIdle()).toBe(true);
		});
		cleanup();
	});

	test('reset() function resets idle state and restarts timer', () => {
		const cleanup = $effect.root(() => {
			const { isIdle, reset } = useIdle(1000);
			flushSync();

			vi.advanceTimersByTime(1000);
			flushSync();
			expect(isIdle()).toBe(true);

			reset();
			flushSync();
			expect(isIdle()).toBe(false);

			vi.advanceTimersByTime(999);
			flushSync();
			expect(isIdle()).toBe(false);

			vi.advanceTimersByTime(1);
			flushSync();
			expect(isIdle()).toBe(true);
		});
		cleanup();
	});

	test('various activity events reset the idle timer', () => {
		const events = ['mousedown', 'keydown', 'touchstart', 'wheel', 'pointermove', 'scroll'];

		for (const eventName of events) {
			const cleanup = $effect.root(() => {
				const { isIdle } = useIdle(500);
				flushSync();

				vi.advanceTimersByTime(500);
				flushSync();
				expect(isIdle()).toBe(true);

				window.dispatchEvent(new Event(eventName));
				flushSync();
				expect(isIdle()).toBe(false);
			});
			cleanup();
		}
	});

	test('cleanup removes event listeners and clears timer', () => {
		const addSpy = vi.spyOn(window, 'addEventListener');
		const removeSpy = vi.spyOn(window, 'removeEventListener');

		const cleanup = $effect.root(() => {
			useIdle(1000);
			flushSync();
		});

		cleanup();
		flushSync();

		const addedMousemove = addSpy.mock.calls.some(([event]) => event === 'mousemove');
		const removedMousemove = removeSpy.mock.calls.some(([event]) => event === 'mousemove');

		expect(addedMousemove).toBe(true);
		expect(removedMousemove).toBe(true);

		addSpy.mockRestore();
		removeSpy.mockRestore();
	});

	test('does not fire after cleanup', () => {
		let capturedIdle: boolean | undefined;

		const cleanup = $effect.root(() => {
			const { isIdle } = useIdle(500);
			flushSync();
			capturedIdle = isIdle();
		});

		cleanup();
		flushSync();

		// After cleanup, advancing time should not cause errors
		vi.advanceTimersByTime(1000);

		expect(capturedIdle).toBe(false);
	});
});

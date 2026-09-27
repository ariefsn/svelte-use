import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { flushSync } from 'svelte';
import { useLongPress } from './useLongPress.svelte.js';

/** Mounts against a real element, returning the manual cleanup the composable hands back. */
function harness(handler: (e: PointerEvent) => void, options?: Parameters<typeof useLongPress>[2]) {
	const el = document.createElement('div');
	document.body.appendChild(el);
	let manualCleanup!: () => void;
	const stop = $effect.root(() => {
		manualCleanup = useLongPress(() => el, handler, options);
	});
	flushSync();
	const down = (x = 0, y = 0) =>
		el.dispatchEvent(new PointerEvent('pointerdown', { clientX: x, clientY: y }));
	const move = (x: number, y: number) =>
		el.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y }));
	return {
		el,
		manualCleanup,
		down,
		move,
		up: () => el.dispatchEvent(new PointerEvent('pointerup')),
		cancel: () => el.dispatchEvent(new PointerEvent('pointercancel')),
		dispose() {
			stop();
			el.remove();
		}
	};
}

describe('useLongPress', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	test('fires handler after delay', () => {
		const handler = vi.fn();
		const h = harness(handler, { delay: 500 });
		h.down();
		vi.advanceTimersByTime(500);
		expect(handler).toHaveBeenCalledOnce();
		h.dispose();
	});

	test('does not fire if released early', () => {
		const handler = vi.fn();
		const h = harness(handler, { delay: 500 });
		h.down();
		vi.advanceTimersByTime(200);
		h.up();
		vi.advanceTimersByTime(300);
		expect(handler).not.toHaveBeenCalled();
		h.dispose();
	});

	test('uses a 500ms default delay', () => {
		const handler = vi.fn();
		const h = harness(handler);
		h.down();
		vi.advanceTimersByTime(499);
		expect(handler).not.toHaveBeenCalled();
		vi.advanceTimersByTime(1);
		expect(handler).toHaveBeenCalledOnce();
		h.dispose();
	});

	test('moving beyond the distance threshold cancels the press', () => {
		const handler = vi.fn();
		const h = harness(handler, { delay: 500, distanceThreshold: 10 });
		h.down(0, 0);
		h.move(20, 0);
		vi.advanceTimersByTime(500);
		expect(handler).not.toHaveBeenCalled();
		h.dispose();
	});

	test('moving within the distance threshold keeps the press alive', () => {
		const handler = vi.fn();
		const h = harness(handler, { delay: 500, distanceThreshold: 10 });
		h.down(0, 0);
		h.move(3, 3);
		vi.advanceTimersByTime(500);
		expect(handler).toHaveBeenCalledOnce();
		h.dispose();
	});

	test('measures distance diagonally, not per axis', () => {
		const handler = vi.fn();
		const h = harness(handler, { delay: 500, distanceThreshold: 10 });
		h.down(0, 0);
		// 8 on each axis is within the threshold per axis, but ~11.3 diagonally.
		h.move(8, 8);
		vi.advanceTimersByTime(500);
		expect(handler).not.toHaveBeenCalled();
		h.dispose();
	});

	test('a move with no press in progress is ignored', () => {
		const handler = vi.fn();
		const h = harness(handler, { delay: 500 });
		h.move(500, 500);
		vi.advanceTimersByTime(500);
		expect(handler).not.toHaveBeenCalled();
		h.dispose();
	});

	test('pointercancel aborts the press', () => {
		const handler = vi.fn();
		const h = harness(handler, { delay: 500 });
		h.down();
		vi.advanceTimersByTime(200);
		h.cancel();
		vi.advanceTimersByTime(300);
		expect(handler).not.toHaveBeenCalled();
		h.dispose();
	});

	test('a second press restarts the timer', () => {
		const handler = vi.fn();
		const h = harness(handler, { delay: 500 });
		h.down();
		vi.advanceTimersByTime(400);
		h.down();
		vi.advanceTimersByTime(400);
		expect(handler).not.toHaveBeenCalled();
		vi.advanceTimersByTime(100);
		expect(handler).toHaveBeenCalledOnce();
		h.dispose();
	});

	test('the returned cleanup detaches the listeners', () => {
		const handler = vi.fn();
		const h = harness(handler, { delay: 500 });
		h.manualCleanup();
		h.down();
		vi.advanceTimersByTime(500);
		expect(handler).not.toHaveBeenCalled();
		h.dispose();
	});

	test('the returned cleanup is safe when the target is gone', () => {
		const handler = vi.fn();
		let manualCleanup!: () => void;
		const stop = $effect.root(() => {
			manualCleanup = useLongPress(() => null, handler);
		});
		flushSync();
		expect(() => manualCleanup()).not.toThrow();
		stop();
	});

	test('scope teardown clears a pending timer', () => {
		const handler = vi.fn();
		const h = harness(handler, { delay: 500 });
		h.down();
		vi.advanceTimersByTime(200);
		h.dispose();
		vi.advanceTimersByTime(300);
		expect(handler).not.toHaveBeenCalled();
	});
});

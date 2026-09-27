import { describe, expect, test, vi } from 'vitest';
import { flushSync } from 'svelte';
import { useSwipe, type SwipeDirection } from './useSwipe.svelte.js';

/** A touch event carrying a single contact point, as the handlers expect. */
function touch(type: string, x: number, y: number, el: HTMLElement): TouchEvent {
	const point = new Touch({ identifier: 0, target: el, clientX: x, clientY: y });
	return new TouchEvent(type, { touches: [point], bubbles: true, cancelable: true });
}

/** Mounts the composable against a real element and hands back a swipe driver. */
function harness(options?: Parameters<typeof useSwipe>[1]) {
	const el = document.createElement('div');
	document.body.appendChild(el);
	let api!: ReturnType<typeof useSwipe>;
	const stop = $effect.root(() => {
		api = useSwipe(() => el, options);
	});
	flushSync();
	return {
		api,
		el,
		swipe(toX: number, toY: number, end = 'touchend') {
			el.dispatchEvent(touch('touchstart', 0, 0, el));
			el.dispatchEvent(touch('touchmove', toX, toY, el));
			el.dispatchEvent(touch(end, toX, toY, el));
		},
		dispose() {
			stop();
			el.remove();
		}
	};
}

describe('useSwipe', () => {
	test('starts with no swiping', () => {
		const h = harness();
		expect(h.api.isSwiping()).toBe(false);
		expect(h.api.direction()).toBe('none');
		h.dispose();
	});

	test('starts with zero coords', () => {
		const h = harness();
		expect(h.api.coordsStart()).toEqual({ x: 0, y: 0 });
		expect(h.api.coordsEnd()).toEqual({ x: 0, y: 0 });
		expect(h.api.lengthX()).toBe(0);
		expect(h.api.lengthY()).toBe(0);
		h.dispose();
	});

	test('touchstart marks a swipe in progress and records the origin', () => {
		const h = harness();
		h.el.dispatchEvent(touch('touchstart', 30, 40, h.el));
		expect(h.api.isSwiping()).toBe(true);
		expect(h.api.coordsStart()).toEqual({ x: 30, y: 40 });
		expect(h.api.coordsEnd()).toEqual({ x: 30, y: 40 });
		h.dispose();
	});

	test.for([
		['right', 120, 0],
		['left', -120, 0],
		['down', 0, 120],
		['up', 0, -120]
	] as const)('detects a %s swipe', ([expected, dx, dy]) => {
		const h = harness();
		h.swipe(dx, dy);
		expect(h.api.direction()).toBe(expected satisfies SwipeDirection);
		expect(h.api.isSwiping()).toBe(false);
		h.dispose();
	});

	test('a movement below the threshold on both axes is not a direction', () => {
		const h = harness({ threshold: 50 });
		h.swipe(10, 10);
		expect(h.api.direction()).toBe('none');
		h.dispose();
	});

	test('honours a custom threshold', () => {
		const h = harness({ threshold: 5 });
		h.swipe(10, 0);
		expect(h.api.direction()).toBe('right');
		h.dispose();
	});

	test('reports travelled distance on both axes', () => {
		const h = harness();
		h.el.dispatchEvent(touch('touchstart', 10, 20, h.el));
		h.el.dispatchEvent(touch('touchmove', 90, 120, h.el));
		expect(h.api.lengthX()).toBe(80);
		expect(h.api.lengthY()).toBe(100);
		h.dispose();
	});

	test('touchcancel ends the swipe like touchend', () => {
		const h = harness();
		h.swipe(120, 0, 'touchcancel');
		expect(h.api.isSwiping()).toBe(false);
		expect(h.api.direction()).toBe('right');
		h.dispose();
	});

	test('ignores move and end that arrive without a start', () => {
		const h = harness();
		h.el.dispatchEvent(touch('touchmove', 200, 0, h.el));
		h.el.dispatchEvent(touch('touchend', 200, 0, h.el));
		expect(h.api.isSwiping()).toBe(false);
		expect(h.api.direction()).toBe('none');
		expect(h.api.coordsEnd()).toEqual({ x: 0, y: 0 });
		h.dispose();
	});

	test('invokes the lifecycle callbacks with the final direction', () => {
		const onStart = vi.fn();
		const onMove = vi.fn();
		const onEnd = vi.fn();
		const h = harness({ onStart, onMove, onEnd });
		h.swipe(120, 0);
		expect(onStart).toHaveBeenCalledOnce();
		expect(onMove).toHaveBeenCalledOnce();
		expect(onEnd).toHaveBeenCalledOnce();
		expect(onEnd.mock.calls[0][1]).toBe('right');
		h.dispose();
	});

	test('accepts non-passive listeners', () => {
		const h = harness({ passive: false });
		h.swipe(120, 0);
		expect(h.api.direction()).toBe('right');
		h.dispose();
	});

	test('reset clears state after a swipe', () => {
		const h = harness();
		h.swipe(120, 0);
		h.api.reset();
		expect(h.api.isSwiping()).toBe(false);
		expect(h.api.direction()).toBe('none');
		expect(h.api.coordsStart()).toEqual({ x: 0, y: 0 });
		expect(h.api.coordsEnd()).toEqual({ x: 0, y: 0 });
		h.dispose();
	});

	test('does nothing when the target is absent', () => {
		let api!: ReturnType<typeof useSwipe>;
		const stop = $effect.root(() => {
			api = useSwipe(() => null);
		});
		flushSync();
		expect(api.isSwiping()).toBe(false);
		stop();
	});
});

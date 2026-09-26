import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useRafFn } from './useRafFn.svelte.js';

/**
 * Drives requestAnimationFrame manually so frames can be stepped one at a
 * time. Real rAF never fires in a headless run with fake timers.
 */
let queue: Array<(t: number) => void> = [];
let now = 0;
let nextId = 1;
let originalRaf: typeof requestAnimationFrame;
let originalCancel: typeof cancelAnimationFrame;
const cancelled = new Set<number>();
const ids = new Map<(t: number) => void, number>();

function step(ms = 16) {
	now += ms;
	const pending = queue;
	queue = [];
	for (const cb of pending) {
		if (!cancelled.has(ids.get(cb)!)) cb(now);
	}
}

beforeEach(() => {
	queue = [];
	cancelled.clear();
	ids.clear();
	now = 0;
	nextId = 1;
	originalRaf = globalThis.requestAnimationFrame;
	originalCancel = globalThis.cancelAnimationFrame;

	globalThis.requestAnimationFrame = ((cb: (t: number) => void) => {
		const id = nextId++;
		ids.set(cb, id);
		queue.push(cb);
		return id;
	}) as typeof requestAnimationFrame;

	globalThis.cancelAnimationFrame = ((id: number) => {
		cancelled.add(id);
	}) as typeof cancelAnimationFrame;
});

afterEach(() => {
	globalThis.requestAnimationFrame = originalRaf;
	globalThis.cancelAnimationFrame = originalCancel;
});

describe('useRafFn', () => {
	test('starts automatically and runs each frame', () => {
		const fn = vi.fn();
		const cleanup = $effect.root(() => {
			useRafFn(fn);
			flushSync();

			step();
			step();

			expect(fn).toHaveBeenCalledTimes(2);
		});
		cleanup();
	});

	test('reports isActive', () => {
		const cleanup = $effect.root(() => {
			const { isActive } = useRafFn(() => {});
			flushSync();
			expect(isActive()).toBe(true);
		});
		cleanup();
	});

	test('does not start when immediate is false', () => {
		const fn = vi.fn();
		const cleanup = $effect.root(() => {
			const { isActive } = useRafFn(fn, { immediate: false });
			flushSync();

			step();

			expect(fn).not.toHaveBeenCalled();
			expect(isActive()).toBe(false);
		});
		cleanup();
	});

	test('resume() actually starts ticking', () => {
		// Regression guard for the useIntervalFn class of bug: if the cleanup
		// effect tracked `active`, resume() would schedule a frame and the
		// effect re-run would immediately cancel it.
		const fn = vi.fn();
		const cleanup = $effect.root(() => {
			const { resume, isActive } = useRafFn(fn, { immediate: false });
			flushSync();

			resume();
			flushSync();

			expect(isActive()).toBe(true);

			step();
			step();

			expect(fn).toHaveBeenCalledTimes(2);
		});
		cleanup();
	});

	test('pause() stops the loop', () => {
		const fn = vi.fn();
		const cleanup = $effect.root(() => {
			const { pause, isActive } = useRafFn(fn);
			flushSync();

			step();
			pause();
			step();

			expect(isActive()).toBe(false);
			expect(fn).toHaveBeenCalledOnce();
		});
		cleanup();
	});

	test('resume() is a no-op while already running', () => {
		const fn = vi.fn();
		const cleanup = $effect.root(() => {
			const { resume } = useRafFn(fn);
			flushSync();

			resume();
			resume();
			step();

			// One queued frame, not three.
			expect(fn).toHaveBeenCalledOnce();
		});
		cleanup();
	});

	test('passes delta and timestamp', () => {
		const fn = vi.fn();
		const cleanup = $effect.root(() => {
			useRafFn(fn);
			flushSync();

			step(16);
			expect(fn).toHaveBeenLastCalledWith({ delta: 0, timestamp: 16 });

			step(20);
			expect(fn).toHaveBeenLastCalledWith({ delta: 20, timestamp: 36 });
		});
		cleanup();
	});

	test('fpsLimit throttles the callback without stopping the loop', () => {
		const fn = vi.fn();
		const cleanup = $effect.root(() => {
			// 30fps → at least 33.3ms between calls
			useRafFn(fn, { fpsLimit: 30 });
			flushSync();

			step(16); // delta 0 on first frame → runs
			step(16); // delta 16 → skipped
			expect(fn).toHaveBeenCalledOnce();

			step(20); // delta 36 since last run → runs
			expect(fn).toHaveBeenCalledTimes(2);
		});
		cleanup();
	});

	test('cancels the pending frame on scope destroy', () => {
		const fn = vi.fn();
		const cleanup = $effect.root(() => {
			useRafFn(fn);
			flushSync();
		});

		cleanup();
		step();

		expect(fn).not.toHaveBeenCalled();
	});
});

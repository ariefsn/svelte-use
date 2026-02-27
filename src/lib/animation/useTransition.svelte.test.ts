import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { flushSync } from 'svelte';
import { useTransition, linear, cubicInOut } from './useTransition.svelte.js';

// ---------------------------------------------------------------------------
// rAF / performance mock helpers
// ---------------------------------------------------------------------------

/**
 * Install synchronous fake implementations of `requestAnimationFrame`,
 * `cancelAnimationFrame`, and `performance.now`.
 *
 * `advanceTime(ms)` runs all pending frames up to the specified elapsed time,
 * incrementing the fake clock and invoking each callback in order.
 */
function installFakeRAF() {
	type Callback = (time: number) => void;
	let currentTime = 0;
	const pending = new Map<number, Callback>();
	let nextId = 1;

	const raf = vi.fn((cb: Callback) => {
		const id = nextId++;
		pending.set(id, cb);
		return id;
	});

	const caf = vi.fn((id: number) => {
		pending.delete(id);
	});

	vi.stubGlobal('requestAnimationFrame', raf);
	vi.stubGlobal('cancelAnimationFrame', caf);
	vi.spyOn(performance, 'now').mockImplementation(() => currentTime);

	function advanceTime(ms: number) {
		currentTime += ms;
		// Drain the frame queue at the new timestamp.
		const frames = [...pending.entries()];
		pending.clear();
		for (const [, cb] of frames) {
			cb(currentTime);
		}
	}

	function reset() {
		currentTime = 0;
		pending.clear();
		nextId = 1;
	}

	return { advanceTime, reset };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('linear easing', () => {
	test('returns the same value', () => {
		const cleanup = $effect.root(() => {
			expect(linear(0)).toBe(0);
			expect(linear(0.5)).toBe(0.5);
			expect(linear(1)).toBe(1);
		});
		cleanup();
	});
});

describe('cubicInOut easing', () => {
	test('returns 0 at t=0 and 1 at t=1', () => {
		const cleanup = $effect.root(() => {
			expect(cubicInOut(0)).toBe(0);
			expect(cubicInOut(1)).toBe(1);
		});
		cleanup();
	});

	test('returns 0.5 at t=0.5 (symmetric midpoint)', () => {
		const cleanup = $effect.root(() => {
			expect(cubicInOut(0.5)).toBeCloseTo(0.5, 5);
		});
		cleanup();
	});
});

describe('useTransition', () => {
	let fakeRAF: ReturnType<typeof installFakeRAF>;

	beforeEach(() => {
		fakeRAF = installFakeRAF();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
		fakeRAF.reset();
	});

	test('returns a getter function', () => {
		const cleanup = $effect.root(() => {
			const val = useTransition(() => 0);
			expect(typeof val).toBe('function');
		});
		cleanup();
	});

	test('initial value matches source immediately', () => {
		const cleanup = $effect.root(() => {
			const val = useTransition(() => 42);
			flushSync();
			// Before any animation frame the value equals the initial source.
			expect(val()).toBe(42);
		});
		cleanup();
	});

	test('value reaches target after full duration elapses', () => {
		let source = $state(0);
		let result: ReturnType<typeof useTransition> | undefined;

		const cleanup = $effect.root(() => {
			result = useTransition(() => source, { duration: 200, easing: linear });
			flushSync();
			source = 100;
			flushSync();
		});

		// Advance past the full duration.
		fakeRAF.advanceTime(200);
		expect(result!()).toBeCloseTo(100, 1);

		cleanup();
	});

	test('interpolates mid-way through animation with linear easing', () => {
		let source = $state(0);
		let result: ReturnType<typeof useTransition> | undefined;

		const cleanup = $effect.root(() => {
			result = useTransition(() => source, { duration: 200, easing: linear });
			flushSync();
			source = 100;
			flushSync();
		});

		// Advance to the midpoint.
		fakeRAF.advanceTime(100);
		expect(result!()).toBeCloseTo(50, 0);

		cleanup();
	});

	test('cancels pending frame and restarts when source changes mid-animation', () => {
		let source = $state(0);
		let result: ReturnType<typeof useTransition> | undefined;

		const cleanup = $effect.root(() => {
			result = useTransition(() => source, { duration: 200, easing: linear });
			flushSync();
			source = 100;
			flushSync();
		});

		fakeRAF.advanceTime(50); // halfway through first animation
		const midValue = result!();
		expect(midValue).toBeCloseTo(25, 0);

		// Change source again — should restart from current midValue toward 200.
		$effect.root(() => {
			source = 200;
			flushSync();
		});

		fakeRAF.advanceTime(200); // complete new animation
		expect(result!()).toBeCloseTo(200, 1);

		cleanup();
	});

	test('defaults to 300ms duration', () => {
		let source = $state(0);
		let result: ReturnType<typeof useTransition> | undefined;

		const cleanup = $effect.root(() => {
			result = useTransition(() => source, { easing: linear });
			flushSync();
			source = 300;
			flushSync();
		});

		fakeRAF.advanceTime(150); // half of default 300ms
		expect(result!()).toBeCloseTo(150, 0);

		cleanup();
	});

	test('clamps value at target after duration is exceeded', () => {
		let source = $state(0);
		let result: ReturnType<typeof useTransition> | undefined;

		const cleanup = $effect.root(() => {
			result = useTransition(() => source, { duration: 100, easing: linear });
			flushSync();
			source = 50;
			flushSync();
		});

		fakeRAF.advanceTime(200); // well beyond duration
		expect(result!()).toBeCloseTo(50, 1);

		cleanup();
	});

	test('cleanup cancels pending animation frame on scope destroy', () => {
		let source = $state(0);

		const cleanup = $effect.root(() => {
			useTransition(() => source, { duration: 200, easing: linear });
			flushSync();
			source = 100;
			flushSync();
		});

		fakeRAF.advanceTime(50); // start animation
		cleanup(); // destroy scope — should cancel the pending frame

		// cancelAnimationFrame should have been called.
		expect(cancelAnimationFrame).toHaveBeenCalled();
	});

	test('SSR safe — jumps to target value without rAF', () => {
		vi.unstubAllGlobals();
		// Remove rAF to simulate server environment.
		const rafBackup = globalThis.requestAnimationFrame;
		// @ts-expect-error intentional undefined for SSR test
		globalThis.requestAnimationFrame = undefined;

		let result: ReturnType<typeof useTransition> | undefined;

		const cleanup = $effect.root(() => {
			result = useTransition(() => 99);
			flushSync();
		});

		expect(result!()).toBe(99);
		cleanup();

		globalThis.requestAnimationFrame = rafBackup;
	});

	test('source equal to current value produces no animation frame', () => {
		fakeRAF.reset();
		const rafSpy = vi.mocked(requestAnimationFrame);
		const initialCallCount = rafSpy.mock.calls.length;

		const cleanup = $effect.root(() => {
			useTransition(() => 0, { duration: 200 });
			flushSync();
			// Source has not changed — no rAF should be scheduled.
		});

		expect(rafSpy.mock.calls.length).toBe(initialCallCount);
		cleanup();
	});
});

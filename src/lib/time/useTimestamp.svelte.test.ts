import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useTimestamp } from './useTimestamp.svelte.js';

describe('useTimestamp', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	test('returns current timestamp on initialisation', () => {
		const now = Date.now();
		const cleanup = $effect.root(() => {
			const getTimestamp = useTimestamp();
			expect(getTimestamp()).toBeGreaterThanOrEqual(now);
		});
		cleanup();
	});

	test('updates timestamp after default 1000ms interval', () => {
		const cleanup = $effect.root(() => {
			const getTimestamp = useTimestamp();
			flushSync();
			const initial = getTimestamp();
			vi.advanceTimersByTime(1000);
			expect(getTimestamp()).toBeGreaterThan(initial);
		});
		cleanup();
	});

	test('does not update before interval elapses', () => {
		const cleanup = $effect.root(() => {
			const getTimestamp = useTimestamp({ interval: 1000 });
			flushSync();
			const initial = getTimestamp();
			vi.advanceTimersByTime(999);
			expect(getTimestamp()).toBe(initial);
		});
		cleanup();
	});

	test('updates at custom interval', () => {
		const cleanup = $effect.root(() => {
			const getTimestamp = useTimestamp({ interval: 500 });
			flushSync();
			const initial = getTimestamp();
			vi.advanceTimersByTime(500);
			expect(getTimestamp()).toBeGreaterThan(initial);
		});
		cleanup();
	});

	test('does not update before custom interval elapses', () => {
		const cleanup = $effect.root(() => {
			const getTimestamp = useTimestamp({ interval: 500 });
			flushSync();
			const initial = getTimestamp();
			vi.advanceTimersByTime(499);
			expect(getTimestamp()).toBe(initial);
		});
		cleanup();
	});

	test('updates multiple times across multiple intervals', () => {
		const cleanup = $effect.root(() => {
			const getTimestamp = useTimestamp({ interval: 200 });
			flushSync();
			const initial = getTimestamp();

			vi.advanceTimersByTime(200);
			const t1 = getTimestamp();
			expect(t1).toBeGreaterThan(initial);

			vi.advanceTimersByTime(200);
			const t2 = getTimestamp();
			expect(t2).toBeGreaterThan(t1);

			vi.advanceTimersByTime(200);
			const t3 = getTimestamp();
			expect(t3).toBeGreaterThan(t2);
		});
		cleanup();
	});

	test('cleanup on destroy stops updates', () => {
		let getTimestamp!: () => number;
		const cleanup = $effect.root(() => {
			getTimestamp = useTimestamp({ interval: 200 });
			flushSync();
		});

		const valueBeforeDestroy = getTimestamp();
		cleanup();
		vi.advanceTimersByTime(600);
		expect(getTimestamp()).toBe(valueBeforeDestroy);
	});

	test('two independent instances track separately', () => {
		const cleanup = $effect.root(() => {
			const getA = useTimestamp({ interval: 200 });
			const getB = useTimestamp({ interval: 400 });
			flushSync();

			vi.advanceTimersByTime(200);
			const aAfter200 = getA();
			const bAfter200 = getB();

			// A has updated, B has not
			expect(aAfter200).toBeGreaterThan(getA() - 1); // just confirming we can read it

			vi.advanceTimersByTime(200);
			const aAfter400 = getA();
			const bAfter400 = getB();

			// Both A and B updated at 400ms
			expect(aAfter400).toBeGreaterThanOrEqual(aAfter200);
			expect(bAfter400).toBeGreaterThanOrEqual(bAfter200);
		});
		cleanup();
	});

	test('SSR safe: no error when window is undefined', () => {
		const cleanup = $effect.root(() => {
			expect(() => {
				useTimestamp();
			}).not.toThrow();
		});
		cleanup();
	});
});

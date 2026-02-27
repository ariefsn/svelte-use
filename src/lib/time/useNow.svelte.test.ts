import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useNow } from './useNow.svelte.js';

describe('useNow', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	test('returns current timestamp on initialisation', () => {
		const now = Date.now();
		const cleanup = $effect.root(() => {
			const getNow = useNow();
			expect(getNow()).toBeGreaterThanOrEqual(now);
		});
		cleanup();
	});

	test('updates timestamp after default 1000ms interval', () => {
		const cleanup = $effect.root(() => {
			const getNow = useNow();
			flushSync();
			const initial = getNow();
			vi.advanceTimersByTime(1000);
			expect(getNow()).toBeGreaterThan(initial);
		});
		cleanup();
	});

	test('does not update before interval elapses', () => {
		const cleanup = $effect.root(() => {
			const getNow = useNow({ interval: 1000 });
			flushSync();
			const initial = getNow();
			vi.advanceTimersByTime(999);
			expect(getNow()).toBe(initial);
		});
		cleanup();
	});

	test('updates timestamp at custom interval', () => {
		const cleanup = $effect.root(() => {
			const getNow = useNow({ interval: 500 });
			flushSync();
			const initial = getNow();
			vi.advanceTimersByTime(500);
			expect(getNow()).toBeGreaterThan(initial);
		});
		cleanup();
	});

	test('does not update before custom interval elapses', () => {
		const cleanup = $effect.root(() => {
			const getNow = useNow({ interval: 500 });
			flushSync();
			const initial = getNow();
			vi.advanceTimersByTime(499);
			expect(getNow()).toBe(initial);
		});
		cleanup();
	});

	test('updates multiple times across multiple intervals', () => {
		const cleanup = $effect.root(() => {
			const getNow = useNow({ interval: 200 });
			flushSync();
			const initial = getNow();

			vi.advanceTimersByTime(200);
			const t1 = getNow();
			expect(t1).toBeGreaterThan(initial);

			vi.advanceTimersByTime(200);
			const t2 = getNow();
			expect(t2).toBeGreaterThan(t1);

			vi.advanceTimersByTime(200);
			const t3 = getNow();
			expect(t3).toBeGreaterThan(t2);
		});
		cleanup();
	});

	test('cleanup on destroy stops updates', () => {
		let getNow!: () => number;
		const cleanup = $effect.root(() => {
			getNow = useNow({ interval: 200 });
			flushSync();
		});

		const valueBeforeDestroy = getNow();
		cleanup();
		vi.advanceTimersByTime(600);
		expect(getNow()).toBe(valueBeforeDestroy);
	});

	test('SSR safe: no error when window is undefined', () => {
		const cleanup = $effect.root(() => {
			expect(() => {
				useNow();
			}).not.toThrow();
		});
		cleanup();
	});
});

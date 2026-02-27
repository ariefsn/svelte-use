import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { useTimeAgo } from './useTimeAgo.svelte.js';

describe('useTimeAgo', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	test('returns "just now" for very recent timestamps (< 5 s)', () => {
		const cleanup = $effect.root(() => {
			const now = Date.now();
			const ago = useTimeAgo(() => now - 1000);
			expect(ago()).toBe('just now');
		});
		cleanup();
	});

	test('returns "x seconds ago" for 5–59 seconds', () => {
		const cleanup = $effect.root(() => {
			const now = Date.now();
			const ago = useTimeAgo(() => now - 30_000);
			expect(ago()).toBe('30 seconds ago');
		});
		cleanup();
	});

	test('returns "1 minute ago" (singular)', () => {
		const cleanup = $effect.root(() => {
			const now = Date.now();
			const ago = useTimeAgo(() => now - 60_000);
			expect(ago()).toBe('1 minute ago');
		});
		cleanup();
	});

	test('returns "x minutes ago" (plural) for 2–59 minutes', () => {
		const cleanup = $effect.root(() => {
			const now = Date.now();
			const ago = useTimeAgo(() => now - 5 * 60_000);
			expect(ago()).toBe('5 minutes ago');
		});
		cleanup();
	});

	test('returns "1 hour ago" (singular)', () => {
		const cleanup = $effect.root(() => {
			const now = Date.now();
			const ago = useTimeAgo(() => now - 3_600_000);
			expect(ago()).toBe('1 hour ago');
		});
		cleanup();
	});

	test('returns "x hours ago" (plural)', () => {
		const cleanup = $effect.root(() => {
			const now = Date.now();
			const ago = useTimeAgo(() => now - 3 * 3_600_000);
			expect(ago()).toBe('3 hours ago');
		});
		cleanup();
	});

	test('returns "1 day ago" (singular)', () => {
		const cleanup = $effect.root(() => {
			const now = Date.now();
			const ago = useTimeAgo(() => now - 86_400_000);
			expect(ago()).toBe('1 day ago');
		});
		cleanup();
	});

	test('returns "x days ago" (plural)', () => {
		const cleanup = $effect.root(() => {
			const now = Date.now();
			const ago = useTimeAgo(() => now - 3 * 86_400_000);
			expect(ago()).toBe('3 days ago');
		});
		cleanup();
	});

	test('accepts a Date object', () => {
		const cleanup = $effect.root(() => {
			const date = new Date(Date.now() - 120_000);
			const ago = useTimeAgo(() => date);
			expect(ago()).toBe('2 minutes ago');
		});
		cleanup();
	});

	test('updates label after interval elapses', () => {
		const cleanup = $effect.root(() => {
			let ts = $state(Date.now() - 30_000);
			const ago = useTimeAgo(() => ts, { interval: 1000 });
			expect(ago()).toBe('30 seconds ago');

			vi.advanceTimersByTime(1000);
			expect(ago()).toBe('31 seconds ago');
		});
		cleanup();
	});

	test('cleans up interval on effect teardown', () => {
		const clearSpy = vi.spyOn(globalThis, 'clearInterval');

		const cleanup = $effect.root(() => {
			useTimeAgo(() => Date.now() - 5000, { interval: 1000 });
		});

		cleanup();
		expect(clearSpy).toHaveBeenCalled();
		clearSpy.mockRestore();
	});

	test('uses default 30 s refresh interval when no option provided', () => {
		const cleanup = $effect.root(() => {
			const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');
			useTimeAgo(() => Date.now() - 5000);
			const call = setIntervalSpy.mock.calls.find((c) => c[1] === 30_000);
			expect(call).toBeDefined();
			setIntervalSpy.mockRestore();
		});
		cleanup();
	});

	test('boundary: exactly 5 seconds is "5 seconds ago" not "just now"', () => {
		const cleanup = $effect.root(() => {
			const now = Date.now();
			const ago = useTimeAgo(() => now - 5000);
			expect(ago()).toBe('5 seconds ago');
		});
		cleanup();
	});

	test('boundary: exactly 0 ms diff is "just now"', () => {
		const cleanup = $effect.root(() => {
			const now = Date.now();
			const ago = useTimeAgo(() => now);
			expect(ago()).toBe('just now');
		});
		cleanup();
	});
});

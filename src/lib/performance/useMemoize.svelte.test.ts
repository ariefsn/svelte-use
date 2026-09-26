import { flushSync } from 'svelte';
import { describe, expect, test, vi } from 'vitest';
import { useMemoize } from './useMemoize.svelte.js';

describe('useMemoize', () => {
	test('calls the function once per distinct argument set', () => {
		const cleanup = $effect.root(() => {
			const work = vi.fn((a: number, b: number) => a + b);
			const sum = useMemoize(work);

			expect(sum(1, 2)).toBe(3);
			expect(sum(1, 2)).toBe(3);
			expect(work).toHaveBeenCalledTimes(1);

			expect(sum(2, 3)).toBe(5);
			expect(work).toHaveBeenCalledTimes(2);
		});
		cleanup();
	});

	test('load() bypasses the cache and replaces the entry', () => {
		const cleanup = $effect.root(() => {
			let counter = 0;
			const next = useMemoize((key: string) => `${key}-${++counter}`);

			expect(next('a')).toBe('a-1');
			expect(next('a')).toBe('a-1');
			expect(next.load('a')).toBe('a-2');
			// The refreshed value is what is now cached.
			expect(next('a')).toBe('a-2');
		});
		cleanup();
	});

	test('has(), remove() and clear() manage entries', () => {
		const cleanup = $effect.root(() => {
			const double = useMemoize((n: number) => n * 2);

			expect(double.has(2)).toBe(false);
			double(2);
			expect(double.has(2)).toBe(true);

			double.remove(2);
			expect(double.has(2)).toBe(false);

			double(1);
			double(2);
			double.clear();
			expect(double.has(1)).toBe(false);
			expect(double.size()).toBe(0);
		});
		cleanup();
	});

	test('size is reactive', () => {
		const cleanup = $effect.root(() => {
			const double = useMemoize((n: number) => n * 2);
			const label = $derived(`${double.size()} cached`);

			expect(label).toBe('0 cached');
			double(1);
			flushSync();
			expect(label).toBe('1 cached');
		});
		cleanup();
	});

	test('evicts the least recently used entry past max', () => {
		const cleanup = $effect.root(() => {
			const work = vi.fn((n: number) => n * 2);
			const double = useMemoize(work, { max: 2 });

			double(1);
			double(2);
			// Using 1 again makes 2 the least recent.
			double(1);
			double(3);

			expect(double.size()).toBe(2);
			expect(double.has(1)).toBe(true);
			expect(double.has(3)).toBe(true);
			expect(double.has(2)).toBe(false);
		});
		cleanup();
	});

	test('accepts a custom key for arguments JSON cannot represent', () => {
		const cleanup = $effect.root(() => {
			const work = vi.fn((user: { id: number; seen: Set<string> }) => user.id);
			const byId = useMemoize(work, { getKey: (user) => String(user.id) });

			byId({ id: 1, seen: new Set(['a']) });
			// A different Set, same id — the default JSON key would miss this,
			// since a Set serialises to {}.
			byId({ id: 1, seen: new Set(['b']) });

			expect(work).toHaveBeenCalledTimes(1);
		});
		cleanup();
	});

	test('caches a promise, so concurrent callers share one request', () => {
		const cleanup = $effect.root(() => {
			const work = vi.fn(async (id: number) => id);
			const fetchOne = useMemoize(work);

			const a = fetchOne(1);
			const b = fetchOne(1);

			expect(work).toHaveBeenCalledTimes(1);
			expect(a).toBe(b);
		});
		cleanup();
	});
});

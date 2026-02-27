import { describe, expect, test } from 'vitest';
import { useSorted } from './useSorted.svelte.js';

describe('useSorted', () => {
	test('returns sorted numbers with default comparator', () => {
		const cleanup = $effect.root(() => {
			const sorted = useSorted(() => [3, 1, 2]);
			expect(sorted()).toEqual([1, 2, 3]);
		});
		cleanup();
	});

	test('returns sorted strings with default comparator', () => {
		const cleanup = $effect.root(() => {
			const sorted = useSorted(() => ['banana', 'apple', 'cherry']);
			expect(sorted()).toEqual(['apple', 'banana', 'cherry']);
		});
		cleanup();
	});

	test('applies custom comparator (descending)', () => {
		const cleanup = $effect.root(() => {
			const sorted = useSorted(() => [3, 1, 2], (a, b) => b - a);
			expect(sorted()).toEqual([3, 2, 1]);
		});
		cleanup();
	});

	test('does not mutate original array', () => {
		const cleanup = $effect.root(() => {
			const original = [3, 1, 2];
			useSorted(() => original);
			expect(original).toEqual([3, 1, 2]);
		});
		cleanup();
	});

	test('reacts to source changes', () => {
		const cleanup = $effect.root(() => {
			let nums = $state([5, 3, 4]);
			const sorted = useSorted(() => nums);
			expect(sorted()).toEqual([3, 4, 5]);

			nums = [9, 1, 7];
			expect(sorted()).toEqual([1, 7, 9]);
		});
		cleanup();
	});

	test('handles empty array', () => {
		const cleanup = $effect.root(() => {
			const sorted = useSorted(() => [] as number[]);
			expect(sorted()).toEqual([]);
		});
		cleanup();
	});

	test('handles single-element array', () => {
		const cleanup = $effect.root(() => {
			const sorted = useSorted(() => [42]);
			expect(sorted()).toEqual([42]);
		});
		cleanup();
	});

	test('handles already-sorted array', () => {
		const cleanup = $effect.root(() => {
			const sorted = useSorted(() => [1, 2, 3, 4]);
			expect(sorted()).toEqual([1, 2, 3, 4]);
		});
		cleanup();
	});

	test('handles duplicate values', () => {
		const cleanup = $effect.root(() => {
			const sorted = useSorted(() => [2, 2, 1, 1, 3]);
			expect(sorted()).toEqual([1, 1, 2, 2, 3]);
		});
		cleanup();
	});

	test('sorts objects using custom comparator by property', () => {
		const cleanup = $effect.root(() => {
			const items = [{ n: 3 }, { n: 1 }, { n: 2 }];
			const sorted = useSorted(() => items, (a, b) => a.n - b.n);
			expect(sorted().map((x) => x.n)).toEqual([1, 2, 3]);
		});
		cleanup();
	});

	test('returns a new array reference (no mutation)', () => {
		const cleanup = $effect.root(() => {
			const source = [2, 1];
			const sorted = useSorted(() => source);
			expect(sorted()).not.toBe(source);
		});
		cleanup();
	});
});

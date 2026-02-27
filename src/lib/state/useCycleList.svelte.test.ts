import { describe, expect, test } from 'vitest';
import { useCycleList } from './useCycleList.svelte.js';

describe('useCycleList', () => {
	test('defaults to first item at index 0', () => {
		const cleanup = $effect.root(() => {
			const { state, index } = useCycleList(['a', 'b', 'c']);
			expect(state()).toBe('a');
			expect(index()).toBe(0);
		});
		cleanup();
	});

	test('accepts custom initial index', () => {
		const cleanup = $effect.root(() => {
			const { state, index } = useCycleList(['a', 'b', 'c'], 2);
			expect(state()).toBe('c');
			expect(index()).toBe(2);
		});
		cleanup();
	});

	test('next() advances to next item', () => {
		const cleanup = $effect.root(() => {
			const { state, index, next } = useCycleList(['x', 'y', 'z']);
			next();
			expect(state()).toBe('y');
			expect(index()).toBe(1);
		});
		cleanup();
	});

	test('next() wraps around from last to first', () => {
		const cleanup = $effect.root(() => {
			const { state, index, next } = useCycleList(['a', 'b', 'c'], 2);
			next();
			expect(state()).toBe('a');
			expect(index()).toBe(0);
		});
		cleanup();
	});

	test('prev() goes back to previous item', () => {
		const cleanup = $effect.root(() => {
			const { state, index, prev } = useCycleList(['a', 'b', 'c'], 1);
			prev();
			expect(state()).toBe('a');
			expect(index()).toBe(0);
		});
		cleanup();
	});

	test('prev() wraps around from first to last', () => {
		const cleanup = $effect.root(() => {
			const { state, index, prev } = useCycleList(['a', 'b', 'c'], 0);
			prev();
			expect(state()).toBe('c');
			expect(index()).toBe(2);
		});
		cleanup();
	});

	test('setIndex() moves to the specified index', () => {
		const cleanup = $effect.root(() => {
			const { state, index, setIndex } = useCycleList(['a', 'b', 'c']);
			setIndex(2);
			expect(state()).toBe('c');
			expect(index()).toBe(2);
		});
		cleanup();
	});

	test('setIndex() with out-of-bounds index is ignored', () => {
		const cleanup = $effect.root(() => {
			const { state, index, setIndex } = useCycleList(['a', 'b', 'c']);
			setIndex(99);
			expect(state()).toBe('a');
			expect(index()).toBe(0);

			setIndex(-1);
			expect(state()).toBe('a');
			expect(index()).toBe(0);
		});
		cleanup();
	});

	test('does not mutate original list', () => {
		const cleanup = $effect.root(() => {
			const original = ['a', 'b', 'c'];
			const { next, prev } = useCycleList(original);
			next();
			next();
			prev();
			expect(original).toEqual(['a', 'b', 'c']);
		});
		cleanup();
	});

	test('works with a single-element list', () => {
		const cleanup = $effect.root(() => {
			const { state, index, next, prev } = useCycleList(['only']);
			expect(state()).toBe('only');
			next();
			expect(state()).toBe('only');
			expect(index()).toBe(0);
			prev();
			expect(state()).toBe('only');
		});
		cleanup();
	});

	test('guards operations on an empty list', () => {
		const cleanup = $effect.root(() => {
			const { index, next, prev, setIndex } = useCycleList<string>([]);
			next();
			prev();
			setIndex(0);
			expect(index()).toBe(0);
		});
		cleanup();
	});

	test('clamps out-of-bounds initialIndex', () => {
		const cleanup = $effect.root(() => {
			const { index } = useCycleList(['a', 'b', 'c'], 100);
			expect(index()).toBe(2);
		});
		cleanup();
	});

	test('full cycle with next()', () => {
		const cleanup = $effect.root(() => {
			const { state, next } = useCycleList([1, 2, 3]);
			expect(state()).toBe(1);
			next();
			expect(state()).toBe(2);
			next();
			expect(state()).toBe(3);
			next();
			expect(state()).toBe(1);
		});
		cleanup();
	});

	test('supports generic types (numbers)', () => {
		const cleanup = $effect.root(() => {
			const { state, next } = useCycleList([10, 20, 30]);
			next();
			expect(state()).toBe(20);
		});
		cleanup();
	});
});

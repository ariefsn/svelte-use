import { flushSync } from 'svelte';
import { describe, expect, test } from 'vitest';
import { useVirtualList } from './useVirtualList.svelte.js';

/** Builds a simple array of N labelled items. */
function makeItems(count: number): Array<{ id: number; label: string }> {
	return Array.from({ length: count }, (_, i) => ({ id: i, label: `Item ${i}` }));
}

describe('useVirtualList', () => {
	test('renders a subset of items (not the full list)', () => {
		const cleanup = $effect.root(() => {
			const items = makeItems(1000);
			const { list } = useVirtualList(() => items, { itemHeight: 40 });
			flushSync();

			// Without a known containerHeight the list still renders a bounded subset
			expect(list().length).toBeLessThan(1000);
		});
		cleanup();
	});

	test('each item includes index, data and style', () => {
		const cleanup = $effect.root(() => {
			const items = makeItems(100);
			const { list } = useVirtualList(() => items, { itemHeight: 50 });
			flushSync();

			const first = list()[0];
			expect(first).toHaveProperty('index');
			expect(first).toHaveProperty('data');
			expect(first).toHaveProperty('style');
			expect(typeof first.index).toBe('number');
			expect(typeof first.style).toBe('string');
		});
		cleanup();
	});

	test('item style contains correct top offset based on index', () => {
		const cleanup = $effect.root(() => {
			const items = makeItems(50);
			const { list } = useVirtualList(() => items, { itemHeight: 40 });
			flushSync();

			for (const item of list()) {
				const expectedTop = `top: ${item.index * 40}px`;
				expect(item.style).toContain(expectedTop);
			}
		});
		cleanup();
	});

	test('item style contains correct height', () => {
		const cleanup = $effect.root(() => {
			const items = makeItems(20);
			const { list } = useVirtualList(() => items, { itemHeight: 60 });
			flushSync();

			for (const item of list()) {
				expect(item.style).toContain('height: 60px');
			}
		});
		cleanup();
	});

	test('wrapperProps style reflects total list height', () => {
		const cleanup = $effect.root(() => {
			const items = makeItems(100);
			const { wrapperProps } = useVirtualList(() => items, { itemHeight: 50 });
			flushSync();

			// 100 items × 50px = 5000px
			expect(wrapperProps.style).toContain('height: 5000px');
		});
		cleanup();
	});

	test('containerProps exposes an onscroll handler', () => {
		const cleanup = $effect.root(() => {
			const items = makeItems(50);
			const { containerProps } = useVirtualList(() => items, { itemHeight: 40 });
			expect(typeof containerProps.onscroll).toBe('function');
		});
		cleanup();
	});

	test('containerProps.style contains overflow-y: auto', () => {
		const cleanup = $effect.root(() => {
			const { containerProps } = useVirtualList(() => makeItems(10), { itemHeight: 40 });
			expect(containerProps.style).toContain('overflow-y: auto');
		});
		cleanup();
	});

	test('returns empty list when source array is empty', () => {
		const cleanup = $effect.root(() => {
			const { list } = useVirtualList(() => [], { itemHeight: 40 });
			flushSync();
			expect(list()).toHaveLength(0);
		});
		cleanup();
	});

	test('scroll event updates visible items', () => {
		const cleanup = $effect.root(() => {
			const items = makeItems(500);
			const { list, containerProps } = useVirtualList(() => items, { itemHeight: 40 });
			flushSync();

			const initialFirstIndex = list()[0]?.index ?? 0;

			// Simulate scrolling down 800px in a 400px-high container
			const mockTarget = { scrollTop: 800, clientHeight: 400 };
			containerProps.onscroll({ target: mockTarget } as unknown as Event);
			flushSync();

			const afterScrollFirstIndex = list()[0]?.index ?? 0;
			// After scrolling, startIndex should be greater than before
			expect(afterScrollFirstIndex).toBeGreaterThan(initialFirstIndex);
		});
		cleanup();
	});

	test('overscan increases rendered count beyond visible window', () => {
		const cleanup = $effect.root(() => {
			const items = makeItems(500);
			const { list: listA, containerProps: cA } = useVirtualList(() => items, {
				itemHeight: 40,
				overscan: 0
			});
			const { list: listB, containerProps: cB } = useVirtualList(() => items, {
				itemHeight: 40,
				overscan: 5
			});
			flushSync();

			// Simulate a container of known height
			const mockTarget = { scrollTop: 0, clientHeight: 400 };
			cA.onscroll({ target: mockTarget } as unknown as Event);
			cB.onscroll({ target: mockTarget } as unknown as Event);
			flushSync();

			// With overscan=5 we expect more items rendered than overscan=0
			expect(listB().length).toBeGreaterThan(listA().length);
		});
		cleanup();
	});

	test('items have contiguous indices', () => {
		const cleanup = $effect.root(() => {
			const items = makeItems(200);
			const { list, containerProps } = useVirtualList(() => items, { itemHeight: 40 });
			flushSync();

			const mockTarget = { scrollTop: 0, clientHeight: 400 };
			containerProps.onscroll({ target: mockTarget } as unknown as Event);
			flushSync();

			const rendered = list();
			for (let i = 1; i < rendered.length; i++) {
				expect(rendered[i].index).toBe(rendered[i - 1].index + 1);
			}
		});
		cleanup();
	});
});

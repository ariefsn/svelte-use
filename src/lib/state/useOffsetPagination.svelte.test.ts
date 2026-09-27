import { flushSync } from 'svelte';
import { describe, expect, test, vi } from 'vitest';
import { useOffsetPagination } from './useOffsetPagination.svelte.js';

describe('useOffsetPagination', () => {
	test('computes page count and offset', () => {
		const cleanup = $effect.root(() => {
			const pagination = useOffsetPagination({ total: 95, pageSize: 10 });

			expect(pagination.page()).toBe(1);
			expect(pagination.pageCount()).toBe(10);
			expect(pagination.offset()).toBe(0);
			expect(pagination.isFirstPage()).toBe(true);
			expect(pagination.isLastPage()).toBe(false);
		});
		cleanup();
	});

	test('navigates and reports edges', () => {
		const cleanup = $effect.root(() => {
			const pagination = useOffsetPagination({ total: 30, pageSize: 10 });

			pagination.next();
			flushSync();
			expect(pagination.page()).toBe(2);
			expect(pagination.offset()).toBe(10);

			pagination.last();
			flushSync();
			expect(pagination.page()).toBe(3);
			expect(pagination.isLastPage()).toBe(true);

			// Past the end clamps rather than erroring.
			pagination.next();
			flushSync();
			expect(pagination.page()).toBe(3);

			pagination.first();
			flushSync();
			expect(pagination.page()).toBe(1);

			pagination.prev();
			flushSync();
			expect(pagination.page()).toBe(1);
		});
		cleanup();
	});

	test('corrects itself when total shrinks under the current page', () => {
		// The case the derived-not-stored design exists for: no effect, and no
		// intermediate render showing an out-of-range page.
		const cleanup = $effect.root(() => {
			let total = $state(100);
			const pagination = useOffsetPagination({ total: () => total, pageSize: 10 });

			pagination.go(9);
			flushSync();
			expect(pagination.page()).toBe(9);

			total = 25;
			flushSync();

			expect(pagination.pageCount()).toBe(3);
			expect(pagination.page()).toBe(3);
			expect(pagination.isLastPage()).toBe(true);
		});
		cleanup();
	});

	test('restores the requested page when total grows back', () => {
		const cleanup = $effect.root(() => {
			let total = $state(100);
			const pagination = useOffsetPagination({ total: () => total, pageSize: 10 });

			pagination.go(9);
			total = 25;
			flushSync();
			expect(pagination.page()).toBe(3);

			// Because the request is stored unclamped, the original intent
			// survives; a stored-clamped implementation would be stuck at 3.
			total = 100;
			flushSync();
			expect(pagination.page()).toBe(9);
		});
		cleanup();
	});

	test('always reports at least one page, even with no items', () => {
		const cleanup = $effect.root(() => {
			const pagination = useOffsetPagination({ total: 0, pageSize: 10 });

			expect(pagination.pageCount()).toBe(1);
			expect(pagination.page()).toBe(1);
			expect(pagination.isFirstPage()).toBe(true);
			expect(pagination.isLastPage()).toBe(true);
		});
		cleanup();
	});

	test('reacts to a changing page size', () => {
		const cleanup = $effect.root(() => {
			let size = $state(10);
			const pagination = useOffsetPagination({ total: 100, pageSize: () => size });

			expect(pagination.pageCount()).toBe(10);

			size = 25;
			flushSync();
			expect(pagination.pageCount()).toBe(4);
		});
		cleanup();
	});

	test('onPageChange fires on change but not on the initial render', () => {
		const onPageChange = vi.fn();

		const cleanup = $effect.root(() => {
			const pagination = useOffsetPagination({ total: 50, pageSize: 10, onPageChange });
			flushSync();

			expect(onPageChange).not.toHaveBeenCalled();

			pagination.next();
			flushSync();

			expect(onPageChange).toHaveBeenCalledWith({ page: 2, pageSize: 10, pageCount: 5 });
			expect(onPageChange).toHaveBeenCalledTimes(1);
		});
		cleanup();
	});

	test('honours a starting page', () => {
		const cleanup = $effect.root(() => {
			const pagination = useOffsetPagination({ total: 100, pageSize: 10, page: 4 });
			expect(pagination.page()).toBe(4);
			expect(pagination.offset()).toBe(30);
		});
		cleanup();
	});
});

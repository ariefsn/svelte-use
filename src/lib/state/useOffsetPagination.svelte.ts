import { toGetter, type MaybeGetter } from '../internal/toGetter.js';

/** A snapshot of the pagination state. */
export interface PaginationState {
	/** The current page, 1-based. */
	page: number;
	/** Items per page. */
	pageSize: number;
	/** Total pages, at least 1. */
	pageCount: number;
}

/** Options for `useOffsetPagination`. */
export interface UseOffsetPaginationOptions {
	/** Total number of items. A getter keeps it reactive. */
	total: MaybeGetter<number>;
	/** Items per page. @default 10 */
	pageSize?: MaybeGetter<number>;
	/** Page to start on, 1-based. @default 1 */
	page?: number;
	/** Called when the resolved page changes — not on the initial render. */
	onPageChange?: (state: PaginationState) => void;
}

/** Return value of `useOffsetPagination`. */
export interface UseOffsetPaginationReturn {
	/** The current page, 1-based and always within range. */
	page: () => number;
	/** Items per page. */
	pageSize: () => number;
	/** Total pages, at least 1 even when there are no items. */
	pageCount: () => number;
	/** Index of the first item on this page — the `offset` for a query or `slice`. */
	offset: () => number;
	/** Whether this is the first page. */
	isFirstPage: () => boolean;
	/** Whether this is the last page. */
	isLastPage: () => boolean;
	/** Goes to a page. Out-of-range values are clamped, not rejected. */
	go: (page: number) => void;
	/** Goes to the next page, if there is one. */
	next: () => void;
	/** Goes to the previous page, if there is one. */
	prev: () => void;
	/** Goes to the first page. */
	first: () => void;
	/** Goes to the last page. */
	last: () => void;
}

/**
 * Offset-based pagination state.
 *
 * The current page is **derived**, never stored clamped. That is what makes it
 * correct when `total` shrinks underneath it: showing page 9 of a list that
 * just dropped to 3 pages resolves to page 3 immediately, with no effect and
 * no intermediate wrong render.
 *
 * Clamping in an `$effect` instead — the obvious implementation — reads and
 * writes the same state and re-triggers itself. It is also invisible to
 * `scripts/check-effects.mjs`, which only matches `++`, `--` and compound
 * assignment, so `page = Math.min(page, pageCount)` would pass lint and fail
 * at runtime.
 *
 * Pure state with no DOM or timers, so it renders on the server.
 *
 * @param options - Total, page size and the starting page
 * @returns Pagination state plus navigation
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useOffsetPagination } from '@ariefsn/svelte-use';
 *
 *   let items = $state<Item[]>([]);
 *   const pagination = useOffsetPagination({
 *     total: () => items.length,
 *     pageSize: 20
 *   });
 *
 *   const visible = $derived(
 *     items.slice(pagination.offset(), pagination.offset() + pagination.pageSize())
 *   );
 * </script>
 *
 * <button onclick={pagination.prev} disabled={pagination.isFirstPage()}>Previous</button>
 * <span>{pagination.page()} / {pagination.pageCount()}</span>
 * <button onclick={pagination.next} disabled={pagination.isLastPage()}>Next</button>
 * ```
 */
export function useOffsetPagination(
	options: UseOffsetPaginationOptions
): UseOffsetPaginationReturn {
	const getTotal = toGetter(options.total);
	const getPageSize = toGetter(options.pageSize ?? 10);
	const { onPageChange } = options;

	/** What the caller asked for, before clamping. */
	let requested = $state(options.page ?? 1);

	const pageSize = $derived(Math.max(1, Math.floor(getPageSize())));
	const pageCount = $derived(Math.max(1, Math.ceil(Math.max(0, getTotal()) / pageSize)));

	// Derived, not stored: when `total` shrinks, this corrects itself with no
	// effect and no render showing an out-of-range page.
	const page = $derived(Math.min(Math.max(1, Math.floor(requested)), pageCount));

	if (onPageChange) {
		// Plain `let`, not `$state`, so recording the baseline does not itself
		// invalidate the effect. The effect only *reads* `page` and calls out —
		// it writes no state, so it cannot re-trigger itself.
		let previous = page;

		$effect(() => {
			const current = page;
			if (current === previous) return;
			previous = current;
			onPageChange({ page: current, pageSize, pageCount });
		});
	}

	function go(next: number): void {
		requested = next;
	}

	return {
		page: () => page,
		pageSize: () => pageSize,
		pageCount: () => pageCount,
		offset: () => (page - 1) * pageSize,
		isFirstPage: () => page === 1,
		isLastPage: () => page === pageCount,
		go,
		next: () => go(page + 1),
		prev: () => go(page - 1),
		first: () => go(1),
		last: () => go(pageCount)
	};
}

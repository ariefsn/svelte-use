/**
 * A single visible row produced by {@link useVirtualList}.
 * @template T - The type of data stored in the list.
 */
export interface VirtualItem<T> {
	/** Zero-based index into the source array. */
	index: number;
	/** The data element at this index. */
	data: T;
	/** Inline CSS string positioning this item absolutely within the wrapper. */
	style: string;
}

/**
 * Options accepted by {@link useVirtualList}.
 */
export interface UseVirtualListOptions {
	/** Fixed height of every row in pixels. */
	itemHeight: number;
	/**
	 * Number of extra items to render above and below the visible window to
	 * reduce blank flashes during fast scrolling.
	 * @default 3
	 */
	overscan?: number;
}

/**
 * Return value of {@link useVirtualList}.
 * @template T - The type of data stored in the list.
 */
export interface UseVirtualListReturn<T> {
	/**
	 * Getter returning only the items that are currently visible (plus
	 * overscan), each augmented with positional style information.
	 */
	list: () => VirtualItem<T>[];
	/**
	 * Props to spread onto the scrollable outer container element.
	 * Contains an inline `style` that sets the container height.
	 */
	containerProps: {
		style: string;
		onscroll: (event: Event) => void;
	};
	/**
	 * Props to spread onto the inner wrapper element.
	 * Contains an inline `style` that sets the total list height so the
	 * scrollbar reflects the full dataset.
	 */
	wrapperProps: {
		style: string;
	};
	/**
	 * Bind the scrollable container element to this ref so the hook can
	 * measure its height immediately via `ResizeObserver`, enabling correct
	 * rendering before the first scroll event fires.
	 *
	 * @example
	 * ```svelte
	 * <div bind:this={containerRef} ...>
	 * ```
	 */
	containerRef: (el: HTMLElement | null) => void;
}

/**
 * High-performance virtual list for Svelte 5.
 *
 * Calculates which items from `list()` are currently visible based on the
 * scroll position of the container, rendering only those items plus an
 * optional overscan buffer. Items are absolutely positioned inside a wrapper
 * whose height equals `list().length * itemHeight` so that the scrollbar
 * behaves as though all items were rendered.
 *
 * No DOM mutations are performed – all calculations are purely reactive.
 * Safe to call during SSR (the initial `scrollTop` is `0`).
 *
 * @param list - Reactive getter returning the full array of items.
 * @param options - `itemHeight` (required) and optional `overscan` count.
 * @returns An object containing `list`, `containerProps`, `wrapperProps`, and `containerRef`.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useVirtualList } from '$lib/virtual/useVirtualList.svelte.js';
 *
 *   const items = Array.from({ length: 10_000 }, (_, i) => ({ id: i, label: `Item ${i}` }));
 *   const { list, containerProps, wrapperProps, containerRef } = useVirtualList(() => items, { itemHeight: 40 });
 * </script>
 *
 * <div bind:this={containerRef} style={containerProps.style} onscroll={containerProps.onscroll}>
 *   <div style={wrapperProps.style}>
 *     {#each list() as row (row.index)}
 *       <div style={row.style}>{row.data.label}</div>
 *     {/each}
 *   </div>
 * </div>
 * ```
 */
export function useVirtualList<T>(
	list: () => T[],
	options: UseVirtualListOptions
): UseVirtualListReturn<T> {
	const { itemHeight, overscan = 3 } = options;

	let scrollTop = $state<number>(0);
	let containerHeight = $state<number>(0);

	/** Total height of all items combined. */
	const totalHeight = $derived(list().length * itemHeight);

	/** Inline style for the outer scrollable container. */
	const containerStyle = 'overflow-y: auto; position: relative;';

	/** Inline style for the inner wrapper that provides full scroll height. */
	const wrapperStyle = $derived(`position: relative; height: ${totalHeight}px;`);

	/** The slice of items currently visible in the viewport with overscan. */
	const visibleItems = $derived<VirtualItem<T>[]>(
		(() => {
			const items = list();
			const total = items.length;

			if (total === 0 || containerHeight <= 0) {
				// When containerHeight is unknown (e.g. SSR), render first page estimate
				const visibleCount = Math.ceil((containerHeight || 0) / itemHeight) + overscan * 2;
				const end = Math.min(visibleCount, total);
				return items.slice(0, end).map((data, i) => ({
					index: i,
					data,
					style: `position: absolute; top: ${i * itemHeight}px; left: 0; right: 0; height: ${itemHeight}px;`
				}));
			}

			const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
			const visibleCount = Math.ceil(containerHeight / itemHeight);
			const endIndex = Math.min(total - 1, startIndex + visibleCount + overscan * 2);

			const result: VirtualItem<T>[] = [];
			for (let i = startIndex; i <= endIndex; i++) {
				result.push({
					index: i,
					data: items[i],
					style: `position: absolute; top: ${i * itemHeight}px; left: 0; right: 0; height: ${itemHeight}px;`
				});
			}
			return result;
		})()
	);

	function handleScroll(event: Event): void {
		const target = event.target as HTMLElement;
		scrollTop = target.scrollTop;
		containerHeight = target.clientHeight;
	}

	// ResizeObserver to keep containerHeight in sync whenever the container
	// is resized (including on initial mount before the first scroll fires).
	let resizeObserver: ResizeObserver | null = null;

	function containerRef(el: HTMLElement | null): void {
		// Tear down any previous observer.
		resizeObserver?.disconnect();
		resizeObserver = null;

		if (!el || typeof ResizeObserver === 'undefined') return;

		// Measure immediately so the list renders correctly on first paint.
		containerHeight = el.clientHeight;
		scrollTop = el.scrollTop;

		resizeObserver = new ResizeObserver(() => {
			containerHeight = el.clientHeight;
		});
		resizeObserver.observe(el);
	}

	$effect(() => {
		return () => {
			resizeObserver?.disconnect();
			resizeObserver = null;
		};
	});

	return {
		list: () => visibleItems,
		containerProps: {
			style: containerStyle,
			onscroll: handleScroll
		},
		wrapperProps: {
			get style() {
				return wrapperStyle;
			}
		},
		containerRef
	};
}

import { untrack } from 'svelte';

/** Which edge triggers a load. */
export type InfiniteScrollDirection = 'top' | 'bottom' | 'left' | 'right';

/** Options for `useInfiniteScroll`. */
export interface UseInfiniteScrollOptions {
	/** How close to the edge, in pixels, before loading is triggered. Default `0`. */
	distance?: number;
	/**
	 * Which edge to watch. `'top'` suits reverse-chronological feeds such as chat transcripts.
	 * Default `'bottom'`.
	 */
	direction?: InfiniteScrollDirection;
	/**
	 * Whether another page may be loaded. Return `false` once the last page has arrived, otherwise
	 * the loader fires forever at the end of the list. Default `() => true`.
	 */
	canLoadMore?: () => boolean;
}

/** Return value of `useInfiniteScroll`. */
export interface UseInfiniteScrollReturn {
	/** `true` while `onLoadMore` is in flight. */
	isLoading: () => boolean;
	/** Checks the scroll position and loads now if the edge is already in range. */
	check: () => void;
}

/** Loads more content as a scroll container nears its edge. */
export function useInfiniteScroll(
	target: () => HTMLElement | null | undefined,
	onLoadMore: () => void | Promise<void>,
	options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn {
	const { distance = 0, direction = 'bottom', canLoadMore = () => true } = options;

	let isLoading = $state(false);

	/** Distance in pixels from the watched edge. */
	function distanceToEdge(el: HTMLElement | Window): number {
		if (el instanceof Window) {
			const doc = document.documentElement;
			switch (direction) {
				case 'top':
					return window.scrollY;
				case 'left':
					return window.scrollX;
				case 'right':
					return doc.scrollWidth - window.scrollX - doc.clientWidth;
				default:
					return doc.scrollHeight - window.scrollY - doc.clientHeight;
			}
		}

		switch (direction) {
			case 'top':
				return el.scrollTop;
			case 'left':
				return el.scrollLeft;
			case 'right':
				return el.scrollWidth - el.scrollLeft - el.clientWidth;
			default:
				return el.scrollHeight - el.scrollTop - el.clientHeight;
		}
	}

	async function load(el: HTMLElement | Window) {
		// `isLoading` and `canLoadMore()` are read inside an effect-triggered
		// path; untrack so this never becomes a dependency of the caller.
		if (untrack(() => isLoading) || !canLoadMore()) return;

		isLoading = true;
		try {
			// Keep loading while the content still does not overflow the container — one page of a short
			// list would otherwise leave the scrollbar unusable and stall the sequence.
			do {
				await onLoadMore();
				if (!canLoadMore()) break;
			} while (distanceToEdge(el) <= distance);
		} finally {
			isLoading = false;
		}
	}

	let manualCheck: () => void = () => {};

	$effect(() => {
		const element = target();
		if (typeof window === 'undefined') return;

		const scroller: HTMLElement | Window = element ?? window;
		const listenTarget: EventTarget = element ?? window;

		function onScroll() {
			if (distanceToEdge(scroller) <= distance) void load(scroller);
		}

		manualCheck = onScroll;

		listenTarget.addEventListener('scroll', onScroll, { passive: true });

		// A container that starts already at the edge — a short list, or one
		// rendered without a scrollbar — would never fire `scroll`.
		untrack(() => onScroll());

		return () => {
			listenTarget.removeEventListener('scroll', onScroll);
			manualCheck = () => {};
		};
	});

	return {
		isLoading: () => isLoading,
		check: () => manualCheck()
	};
}

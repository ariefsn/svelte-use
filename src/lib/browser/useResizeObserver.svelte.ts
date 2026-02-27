/** Return value of `useResizeObserver`. */
export interface UseResizeObserverReturn {
	/** Manually stops the observer and cleans up resources. */
	stop: () => void;
}

/**
 * Lightweight reactive `ResizeObserver` wrapper.
 *
 * Observes the element returned by `target` and invokes `callback` with each
 * `ResizeObserverEntry` whenever the element's size changes. The observer is
 * registered inside a `$effect` and disconnected automatically when the
 * reactive scope is destroyed. Manual cleanup is also available via `stop`.
 *
 * SSR safe — `ResizeObserver` is only accessed in the browser.
 *
 * @param target - Reactive getter returning the element to observe, or `null`
 * @param callback - Called with each `ResizeObserverEntry` on size change
 * @returns Object with a `stop` function for manual cleanup
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useResizeObserver } from 'svelte-use';
 *
 *   let el = $state<HTMLElement | null>(null);
 *   const { stop } = useResizeObserver(
 *     () => el,
 *     (entry) => {
 *       console.info('new size', entry.contentRect.width, entry.contentRect.height);
 *     }
 *   );
 * </script>
 *
 * <div bind:this={el} />
 * ```
 */
export function useResizeObserver(
	target: () => Element | null,
	callback: (entry: ResizeObserverEntry) => void
): UseResizeObserverReturn {
	let observerRef: ResizeObserver | null = null;

	function stop(): void {
		if (observerRef) {
			observerRef.disconnect();
			observerRef = null;
		}
	}

	$effect(() => {
		if (typeof ResizeObserver === 'undefined') return;

		const el = target();
		if (!el) return;

		// Disconnect previous observer when target changes
		stop();

		observerRef = new ResizeObserver((entries: ResizeObserverEntry[]) => {
			for (const entry of entries) {
				callback(entry);
			}
		});

		observerRef.observe(el);

		return () => {
			stop();
		};
	});

	return { stop };
}

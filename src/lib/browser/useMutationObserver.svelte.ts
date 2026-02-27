/** Return value of `useMutationObserver`. */
export interface UseMutationObserverReturn {
	/** Manually stops the observer and cleans up resources. */
	stop: () => void;
}

/**
 * Reactive `MutationObserver` wrapper.
 *
 * Observes the node returned by `target` for DOM mutations and invokes
 * `callback` whenever changes matching the given `options` occur. The
 * observer is registered inside a `$effect` and disconnected automatically
 * when the reactive scope is destroyed or the target changes. Manual cleanup
 * is also available via `stop`.
 *
 * SSR safe — `MutationObserver` is only accessed in the browser.
 *
 * @param target - Reactive getter returning the DOM node to observe, or `null`
 * @param callback - Standard `MutationCallback` invoked with each batch of `MutationRecord`s
 * @param options - Standard `MutationObserverInit` configuration (childList, attributes, etc.)
 * @returns Object with a `stop` function for manual cleanup
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useMutationObserver } from 'svelte-use';
 *
 *   let el = $state<HTMLElement | null>(null);
 *   const { stop } = useMutationObserver(
 *     () => el,
 *     (mutations) => {
 *       for (const m of mutations) console.info(m.type);
 *     },
 *     { childList: true, subtree: true }
 *   );
 * </script>
 *
 * <div bind:this={el} />
 * ```
 */
export function useMutationObserver(
	target: () => Node | null,
	callback: MutationCallback,
	options?: MutationObserverInit
): UseMutationObserverReturn {
	let observerRef: MutationObserver | null = null;

	function stop(): void {
		if (observerRef) {
			observerRef.disconnect();
			observerRef = null;
		}
	}

	$effect(() => {
		if (typeof MutationObserver === 'undefined') return;

		const node = target();
		if (!node) return;

		// Disconnect previous observer when target changes
		stop();

		observerRef = new MutationObserver(callback);
		observerRef.observe(node, options);

		return () => {
			stop();
		};
	});

	return { stop };
}

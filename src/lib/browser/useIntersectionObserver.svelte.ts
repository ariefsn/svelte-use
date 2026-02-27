/** Return value of `useIntersectionObserver`. */
export interface UseIntersectionObserverReturn {
	/** Reactive getter for whether the target is currently intersecting the root. */
	isIntersecting: () => boolean;
	/** Reactive getter for the latest `IntersectionObserverEntry`, or `null` before first observation. */
	entry: () => IntersectionObserverEntry | null;
	/** Manually stops the observer and cleans up resources. */
	stop: () => void;
}

/**
 * Reactive intersection observer utility.
 *
 * Wraps the browser `IntersectionObserver` API and exposes reactive getters
 * for the intersection state. The observer is started inside a `$effect` and
 * automatically stopped when the reactive scope is destroyed. It can also be
 * stopped manually via the returned `stop` function.
 *
 * SSR safe — `IntersectionObserver` is only accessed in the browser.
 *
 * @param target - Reactive getter returning the element to observe, or `null`
 * @param options - Standard `IntersectionObserverInit` options (root, rootMargin, threshold)
 * @returns Object with reactive getters `isIntersecting`, `entry`, and a `stop` function
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useIntersectionObserver } from 'svelte-use';
 *
 *   let el = $state<HTMLElement | null>(null);
 *   const { isIntersecting } = useIntersectionObserver(() => el);
 * </script>
 *
 * <div bind:this={el}>
 *   {isIntersecting() ? 'Visible' : 'Hidden'}
 * </div>
 * ```
 */
export function useIntersectionObserver(
	target: () => Element | null,
	options?: IntersectionObserverInit
): UseIntersectionObserverReturn {
	let isIntersecting = $state(false);
	let entry = $state<IntersectionObserverEntry | null>(null);

	let observerRef: IntersectionObserver | null = null;

	function stop(): void {
		if (observerRef) {
			observerRef.disconnect();
			observerRef = null;
		}
	}

	$effect(() => {
		if (typeof IntersectionObserver === 'undefined') return;

		const el = target();
		if (!el) return;

		// Disconnect any existing observer before creating a new one
		stop();

		observerRef = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
			const latest = entries[entries.length - 1];
			if (!latest) return;
			entry = latest;
			isIntersecting = latest.isIntersecting;
		}, options);

		observerRef.observe(el);

		return () => {
			stop();
		};
	});

	return {
		isIntersecting: () => isIntersecting,
		entry: () => entry,
		stop
	};
}

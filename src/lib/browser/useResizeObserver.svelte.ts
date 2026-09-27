/** Return value of `useResizeObserver`. */
export interface UseResizeObserverReturn {
	/** Manually stops the observer and cleans up resources. */
	stop: () => void;
}

/**
 * Low-level `ResizeObserver` wrapper. Calls your callback with a `ResizeObserverEntry` whenever the
 * target element changes size.
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

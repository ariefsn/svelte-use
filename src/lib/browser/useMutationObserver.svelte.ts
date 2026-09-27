/** Return value of `useMutationObserver`. */
export interface UseMutationObserverReturn {
	/** Manually stops the observer and cleans up resources. */
	stop: () => void;
}

/**
 * Watches for DOM mutations (child additions, attribute changes, subtree modifications) on a target
 * node using `MutationObserver`.
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

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
 * Reactively tracks whether an element is visible within the viewport (or a scroll container) using
 * `IntersectionObserver`.
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

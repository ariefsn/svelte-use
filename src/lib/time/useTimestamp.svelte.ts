export interface UseTimestampOptions {
	/**
	 * Update interval in milliseconds.
	 * Defaults to `1000` (one second).
	 */
	interval?: number;
}

/**
 * Returns a reactive getter that yields the current Unix timestamp in
 * milliseconds, updated at a configurable interval.
 *
 * This is a standalone implementation with its own internal state — it does
 * not delegate to `useNow`.
 *
 * The interval is started immediately and cleaned up when the owning reactive
 * scope is destroyed.
 *
 * SSR-safe: uses `Date.now()` — no `window` or browser-specific APIs are
 * required.
 *
 * @param options - Optional configuration
 * @param options.interval - Update interval in milliseconds (default: `1000`)
 * @returns A getter function returning the current timestamp as a `number`
 *
 * @example
 * ```ts
 * const timestamp = useTimestamp();
 * timestamp(); // e.g. 1700000000000 — updates every second
 *
 * const precise = useTimestamp({ interval: 100 });
 * precise(); // updates every 100ms
 * ```
 */
export function useTimestamp(options: UseTimestampOptions = {}): () => number {
	const { interval = 1000 } = options;

	let timestamp = $state(Date.now());

	$effect(() => {
		const id = setInterval(() => {
			timestamp = Date.now();
		}, interval);

		return () => {
			clearInterval(id);
		};
	});

	return () => timestamp;
}

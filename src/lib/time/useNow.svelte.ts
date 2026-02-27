export interface UseNowOptions {
	/**
	 * Update interval in milliseconds.
	 * Defaults to `1000` (one second).
	 */
	interval?: number;
}

/**
 * Returns a reactive getter that yields the current timestamp (milliseconds
 * since the Unix epoch), updated at a configurable interval.
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
 * const now = useNow();
 * now(); // e.g. 1700000000000 — updates every second
 *
 * const precise = useNow({ interval: 100 });
 * precise(); // updates every 100ms
 * ```
 */
export function useNow(options: UseNowOptions = {}): () => number {
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

/** @internal */
function formatTimeAgo(diffMs: number): string {
	const seconds = Math.floor(diffMs / 1000);

	if (seconds < 5) return 'just now';
	if (seconds < 60) return `${seconds} seconds ago`;

	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;

	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;

	const days = Math.floor(hours / 24);
	return `${days} ${days === 1 ? 'day' : 'days'} ago`;
}

/**
 * Returns a reactive getter that yields a human-readable relative time string,
 * updated periodically.
 *
 * Supported formats: `"just now"`, `"x seconds ago"`, `"x minutes ago"`,
 * `"x hours ago"`, `"x days ago"`.
 *
 * SSR-safe: no interval is set up until the effect runs in the browser. The
 * interval is properly cleaned up on teardown.
 *
 * @param date - Reactive getter returning the reference `Date` or Unix timestamp (ms)
 * @param options.interval - How often (ms) to refresh the output (default: `30_000`)
 * @returns A getter function returning the formatted relative-time string
 *
 * @example
 * ```ts
 * let ts = $state(Date.now() - 90_000);
 * const ago = useTimeAgo(() => ts);
 * // ago() → "1 minutes ago"
 *
 * ts = Date.now() - 3 * 3600 * 1000;
 * // ago() → "3 hours ago"
 * ```
 */
export function useTimeAgo(
	date: () => Date | number,
	options?: { interval?: number }
): () => string {
	const intervalMs = options?.interval ?? 30_000;

	function getMs(): number {
		const d = date();
		return typeof d === 'number' ? d : d.getTime();
	}

	let label = $state(formatTimeAgo(Date.now() - getMs()));

	$effect(() => {
		function refresh(): void {
			label = formatTimeAgo(Date.now() - getMs());
		}

		refresh();

		const id = setInterval(refresh, intervalMs);

		return () => {
			clearInterval(id);
		};
	});

	return () => label;
}

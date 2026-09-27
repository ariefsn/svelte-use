export interface UseTimestampOptions {
	/** Update interval in milliseconds. Defaults to `1000` (one second). */
	interval?: number;
}

/**
 * Returns a reactive getter that yields the current Unix timestamp in milliseconds, updated at a
 * configurable interval. This is a standalone implementation — it does not delegate to `useNow`.
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

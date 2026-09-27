/** Tracks the timestamp (in milliseconds) of when a reactive value last changed. */
export function useLastChanged<T>(getter: () => T): () => number | undefined {
	let timestamp = $state<number | undefined>(undefined);

	$effect(() => {
		getter();
		return () => {
			timestamp = Date.now();
		};
	});

	return () => timestamp;
}

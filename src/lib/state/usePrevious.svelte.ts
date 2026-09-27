/**
 * Tracks the previous value of a reactive getter. Returns `undefined` until the value changes for
 * the first time.
 */
export function usePrevious<T>(getter: () => T): () => T | undefined {
	let previous = $state<T | undefined>(undefined);

	$effect(() => {
		const value = getter();
		return () => {
			previous = value;
		};
	});

	return () => previous;
}

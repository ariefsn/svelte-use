/**
 * Debounces a reactive getter value, delaying updates until the source stops changing for the
 * specified duration.
 */
export function useDebounce<T>(getter: () => T, delay = 300): () => T {
	let debounced = $state<T>(getter());

	$effect(() => {
		const value = getter();
		const id = setTimeout(() => {
			debounced = value;
		}, delay);

		return () => clearTimeout(id);
	});

	return () => debounced;
}

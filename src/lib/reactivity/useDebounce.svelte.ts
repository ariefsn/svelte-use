/**
 * Debounces a reactive getter value, delaying updates until the source
 * stops changing for the specified duration.
 *
 * The returned getter reflects the initial value immediately and only
 * updates after `delay` ms of inactivity. Each change to the source
 * resets the timer.
 *
 * @param getter - Reactive getter function to debounce
 * @param delay - Debounce delay in milliseconds (default: `300`)
 * @returns A getter function returning the debounced value
 *
 * @example
 * ```ts
 * let query = $state('');
 * const debouncedQuery = useDebounce(() => query, 300);
 * // debouncedQuery() reflects `query` only after 300ms of no changes
 * ```
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

/**
 * Tracks the previous value of a reactive getter.
 *
 * The returned getter yields `undefined` until the tracked value changes for
 * the first time, then returns the value from the previous render cycle.
 *
 * @param getter - Reactive getter function to observe
 * @returns A getter function returning the previous value, or `undefined` before any change
 *
 * @example
 * ```ts
 * let count = $state(0);
 * const prev = usePrevious(() => count);
 * // prev() → undefined
 * count = 1;
 * // prev() → 0
 * count = 2;
 * // prev() → 1
 * ```
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

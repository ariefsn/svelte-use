/**
 * Tracks the timestamp (in milliseconds) of when a reactive value last changed.
 *
 * @param getter - Reactive getter function to observe
 * @returns A getter function returning the timestamp of the last change, or `undefined` before any change
 *
 * @example
 * ```ts
 * let count = $state(0);
 * const lastChanged = useLastChanged(() => count);
 * // lastChanged() → undefined
 * count = 1;
 * // lastChanged() → 1710754200000 (Date.now() at time of change)
 * ```
 */
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

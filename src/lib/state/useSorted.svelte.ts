/**
 * Returns a reactive sorted copy of an array. The sorted result updates automatically whenever the
 * source array changes. The original array is never mutated.
 */
export function useSorted<T>(source: () => T[], compareFn?: (a: T, b: T) => number): () => T[] {
	const sorted = $derived([...source()].sort(compareFn));
	return () => sorted;
}

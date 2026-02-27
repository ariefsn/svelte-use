/**
 * Returns a reactive getter that yields a sorted copy of the source array.
 *
 * The sort is recalculated whenever the source changes. The original array is
 * never mutated.
 *
 * @param source - Reactive getter returning the array to sort
 * @param compareFn - Optional comparator; uses the same default as `Array.prototype.sort`
 * @returns A getter function returning the sorted array
 *
 * @example
 * ```ts
 * let nums = $state([3, 1, 2]);
 * const sorted = useSorted(() => nums);
 * // sorted() → [1, 2, 3]
 *
 * nums = [10, 5, 8];
 * // sorted() → [5, 8, 10]
 * ```
 *
 * @example
 * ```ts
 * // Descending sort
 * const sorted = useSorted(() => nums, (a, b) => b - a);
 * ```
 */
export function useSorted<T>(
	source: () => T[],
	compareFn?: (a: T, b: T) => number
): () => T[] {
	const sorted = $derived([...source()].sort(compareFn));
	return () => sorted;
}

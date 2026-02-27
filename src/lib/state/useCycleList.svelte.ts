/**
 * Cycles reactively through a fixed list, wrapping at both ends.
 *
 * The original list is never mutated. Attempting to set an out-of-bounds index
 * is silently ignored.
 *
 * @param list - Array of items to cycle through
 * @param initialIndex - Starting index (default: `0`); clamped to valid range
 * @returns Object containing reactive `state` getter, `index` getter, `next`,
 *   `prev`, and `setIndex` functions
 *
 * @example
 * ```ts
 * const { state, index, next, prev, setIndex } = useCycleList(['a', 'b', 'c']);
 * // state() → 'a', index() → 0
 * next();
 * // state() → 'b', index() → 1
 * next();
 * next();
 * // state() → 'a', index() → 0  (wrapped around)
 * prev();
 * // state() → 'c', index() → 2  (wrapped backward)
 * setIndex(1);
 * // state() → 'b', index() → 1
 * ```
 */
export function useCycleList<T>(
	list: T[],
	initialIndex = 0
): {
	state: () => T;
	index: () => number;
	next: () => void;
	prev: () => void;
	setIndex: (i: number) => void;
} {
	const safeInitial =
		list.length === 0 ? 0 : Math.max(0, Math.min(initialIndex, list.length - 1));

	let currentIndex = $state(safeInitial);

	function next(): void {
		if (list.length === 0) return;
		currentIndex = (currentIndex + 1) % list.length;
	}

	function prev(): void {
		if (list.length === 0) return;
		currentIndex = (currentIndex - 1 + list.length) % list.length;
	}

	function setIndex(i: number): void {
		if (list.length === 0) return;
		if (i < 0 || i >= list.length) return;
		currentIndex = i;
	}

	return {
		get state() {
			return () => list[currentIndex] as T;
		},
		get index() {
			return () => currentIndex;
		},
		next,
		prev,
		setIndex
	};
}

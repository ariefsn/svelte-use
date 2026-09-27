/** Cycles through a list of items reactively. Wraps around at both ends. */
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
	const safeInitial = list.length === 0 ? 0 : Math.max(0, Math.min(initialIndex, list.length - 1));

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

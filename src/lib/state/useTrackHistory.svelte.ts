import { untrack } from 'svelte';

export interface HistorySnapshot<T> {
	value: T;
	timestamp: number;
}

export interface UseTrackHistoryReturn<T> {
	/** Whether undo is available */
	canUndo: () => boolean;
	/** Whether redo is available */
	canRedo: () => boolean;
	/** History of past values (most recent last) */
	history: () => HistorySnapshot<T>[];
	/** Redo history (cleared on new external changes) */
	redoHistory: () => HistorySnapshot<T>[];
	/** Undo to the previous value */
	undo: () => void;
	/** Redo to the next value */
	redo: () => void;
}

/** Tracks changes to a reactive value and provides undo/redo functionality. */
export function useTrackHistory<T>(
	getter: () => T,
	setter: (v: T) => void
): UseTrackHistoryReturn<T> {
	const history = $state<HistorySnapshot<T>[]>([]);
	let redoStack = $state<HistorySnapshot<T>[]>([]);
	let ignoreNext = false;

	$effect(() => {
		const value = getter();
		// untrack mutations to avoid infinite loop — .push() reads the $state array
		untrack(() => {
			if (ignoreNext) {
				ignoreNext = false;
				return;
			}
			history.push({ value, timestamp: Date.now() });
			redoStack = [];
		});
	});

	function undo() {
		if (history.length <= 1) return;
		const current = history.pop()!;
		redoStack.push(current);
		const prev = history[history.length - 1];
		ignoreNext = true;
		setter(prev.value);
	}

	function redo() {
		if (redoStack.length === 0) return;
		const next = redoStack.pop()!;
		history.push(next);
		ignoreNext = true;
		setter(next.value);
	}

	return {
		canUndo: () => history.length > 1,
		canRedo: () => redoStack.length > 0,
		history: () => history,
		redoHistory: () => redoStack,
		undo,
		redo
	};
}

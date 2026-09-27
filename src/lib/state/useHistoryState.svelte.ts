import { useTrackHistory, type UseTrackHistoryReturn } from './useTrackHistory.svelte.js';

export interface UseHistoryStateReturn<T> extends UseTrackHistoryReturn<T> {
	/** The current state value */
	value: T;
}

/** Creates reactive state with built-in undo/redo history tracking. */
export function useHistoryState<T>(initial: T): UseHistoryStateReturn<T> {
	let value = $state<T>(initial);

	const tracker = useTrackHistory(
		() => value,
		(v) => {
			value = v;
		}
	);

	return {
		get value() {
			return value;
		},
		set value(v: T) {
			value = v;
		},
		canUndo: tracker.canUndo,
		canRedo: tracker.canRedo,
		history: tracker.history,
		redoHistory: tracker.redoHistory,
		undo: tracker.undo,
		redo: tracker.redo
	};
}

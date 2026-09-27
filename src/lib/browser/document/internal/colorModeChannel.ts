/** A selection, or `null` for a reset. */
export type ColorModeMessage = string | null;

type ColorModeListener = (mode: ColorModeMessage) => void;

/** Same-page subscribers, keyed by storage key. */
const channels = new Map<string, Set<ColorModeListener>>();

/** Notifies every same-page subscriber for `storageKey`. */
export function publishColorMode(storageKey: string, mode: ColorModeMessage): void {
	const listeners = channels.get(storageKey);
	if (!listeners) return;
	// Copied before iterating: a listener may unsubscribe during delivery.
	for (const listener of [...listeners]) listener(mode);
}

/** Subscribes to same-page selection changes for `storageKey`. */
export function subscribeColorMode(storageKey: string, listener: ColorModeListener): () => void {
	let listeners = channels.get(storageKey);
	if (!listeners) {
		listeners = new Set();
		channels.set(storageKey, listeners);
	}
	listeners.add(listener);

	return () => {
		listeners.delete(listener);
		if (listeners.size === 0) channels.delete(storageKey);
	};
}

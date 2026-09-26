/**
 * A selection, or `null` for a reset.
 *
 * Reset has to be distinguishable: delivering it as a plain `'auto'` would
 * make each subscriber *write* `'auto'`, re-persisting the very key the reset
 * just cleared.
 */
export type ColorModeMessage = string | null;

type ColorModeListener = (mode: ColorModeMessage) => void;

/**
 * Same-page subscribers, keyed by storage key.
 *
 * `useStorage` already syncs across tabs, but the `storage` event does not
 * fire in the tab that caused the write — so two `useColorMode` instances in
 * one document would desync without this. A module-level channel is the
 * cheapest fix that does not involve both instances observing and writing the
 * same DOM attribute.
 */
const channels = new Map<string, Set<ColorModeListener>>();

/** Notifies every same-page subscriber for `storageKey`. */
export function publishColorMode(storageKey: string, mode: ColorModeMessage): void {
	const listeners = channels.get(storageKey);
	if (!listeners) return;
	// Copied before iterating: a listener may unsubscribe during delivery.
	for (const listener of [...listeners]) listener(mode);
}

/**
 * Subscribes to same-page selection changes for `storageKey`.
 *
 * @returns An unsubscribe function, for an `$effect` teardown
 */
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

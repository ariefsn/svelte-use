/**
 * Captures `read()` immediately and writes it back once, when the owning
 * reactive scope is destroyed.
 *
 * The snapshot is taken at call time rather than inside the effect, so it
 * records the value that existed *before* the calling composable wrote
 * anything.
 *
 * The effect body is empty and returns only a teardown. That is deliberate: a
 * teardown is registered whether or not the effect read any reactive state, so
 * there is no dependency to invent "to keep it alive". Adding one would make
 * the effect re-run on unrelated changes and restore the value early.
 *
 * @param read - Reads the value to snapshot, called once, immediately
 * @param write - Writes the snapshot back on destroy
 *
 * @example
 * ```ts
 * useRestoreOnDestroy(
 *   () => document.title,
 *   (title) => { document.title = title; }
 * );
 * ```
 */
export function useRestoreOnDestroy<T>(read: () => T, write: (value: T) => void): void {
	const original = read();
	$effect(() => () => write(original));
}

/**
 * Captures `read()` immediately and writes it back once, when the owning reactive scope is
 * destroyed.
 */
export function useRestoreOnDestroy<T>(read: () => T, write: (value: T) => void): void {
	const original = read();
	$effect(() => () => write(original));
}

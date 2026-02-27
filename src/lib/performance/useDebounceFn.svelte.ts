/**
 * Returns a debounced version of the provided function.
 *
 * The returned function postpones invoking `fn` until after `delay`
 * milliseconds have elapsed since the last call, forwarding all original
 * arguments and preserving the inferred return type. The pending timer is
 * cleared when the reactive scope is destroyed.
 *
 * @param fn - The function to debounce.
 * @param delay - Milliseconds to wait after the last call before invoking `fn`.
 * @returns A debounced function with the same signature as `fn`.
 *
 * @example
 * ```ts
 * const debouncedSearch = useDebounceFn((query: string) => search(query), 300);
 * input.addEventListener('input', (e) => debouncedSearch(e.currentTarget.value));
 * ```
 */
export function useDebounceFn<T extends (...args: Parameters<T>) => ReturnType<T>>(
	fn: T,
	delay: number
): T {
	let timerId: ReturnType<typeof setTimeout> | undefined;

	function debounced(...args: Parameters<T>): ReturnType<T> {
		clearTimeout(timerId);
		timerId = setTimeout(() => {
			fn(...args);
		}, delay);
		return undefined as ReturnType<T>;
	}

	$effect(() => {
		return () => {
			clearTimeout(timerId);
		};
	});

	return debounced as T;
}

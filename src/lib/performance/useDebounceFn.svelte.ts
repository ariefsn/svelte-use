/**
 * Returns a debounced version of a function that only executes after `delay` milliseconds of
 * inactivity. Each new call resets the timer.
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

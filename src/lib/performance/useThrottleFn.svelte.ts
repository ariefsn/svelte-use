/**
 * Returns a throttled version of the provided function.
 *
 * The returned function will invoke `fn` at most once per `delay` milliseconds,
 * forwarding the original arguments and preserving the return type. Any
 * pending trailing timer is cleared when the reactive scope is destroyed.
 *
 * @param fn - The function to throttle.
 * @param delay - Minimum milliseconds between invocations.
 * @returns A throttled function with the same signature as `fn`.
 *
 * @example
 * ```ts
 * const throttledScroll = useThrottleFn((e: Event) => handleScroll(e), 100);
 * window.addEventListener('scroll', throttledScroll);
 * ```
 */
export function useThrottleFn<T extends (...args: Parameters<T>) => ReturnType<T>>(
	fn: T,
	delay: number
): T {
	let lastCall = 0;
	let timerId: ReturnType<typeof setTimeout> | undefined;

	function throttled(...args: Parameters<T>): ReturnType<T> {
		const now = Date.now();
		const remaining = delay - (now - lastCall);

		if (remaining <= 0) {
			clearTimeout(timerId);
			lastCall = now;
			return fn(...args);
		}

		// Schedule a trailing call only – no return value for deferred calls
		clearTimeout(timerId);
		timerId = setTimeout(() => {
			lastCall = Date.now();
			fn(...args);
		}, remaining);

		return undefined as ReturnType<T>;
	}

	$effect(() => {
		return () => {
			clearTimeout(timerId);
		};
	});

	return throttled as T;
}

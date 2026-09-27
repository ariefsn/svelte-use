/**
 * Returns a throttled version of a function that fires at most once per `delay` milliseconds. Uses
 * leading-edge invocation with a trailing call for the remainder of the window.
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

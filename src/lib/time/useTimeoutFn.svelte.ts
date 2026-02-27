/**
 * Manually-controlled timeout utility.
 *
 * Unlike `useTimeout`, this composable does **not** start automatically — you
 * must call `start()` explicitly. The timeout fires once, then becomes idle.
 * Calling `start()` again re-arms it from that point in time.
 *
 * The timeout is cleared and cleaned up when the owning reactive scope is
 * destroyed.
 *
 * @param fn - Function to invoke when the timeout fires
 * @param delay - Delay in milliseconds
 * @returns Object with `start`, `stop`, and `isPending` functions
 *
 * @example
 * ```ts
 * const { start, stop, isPending } = useTimeoutFn(() => console.log('done'), 1000);
 * start();        // arms the timeout
 * isPending();    // → true
 * // after 1000ms → fn fires, isPending() → false
 * stop();         // cancel before it fires (if needed)
 * ```
 */
export function useTimeoutFn(fn: () => void, delay: number) {
	let pending = $state(false);
	let timerId: ReturnType<typeof setTimeout> | undefined;

	function clearTimer() {
		if (timerId !== undefined) {
			clearTimeout(timerId);
			timerId = undefined;
		}
	}

	function stop() {
		clearTimer();
		pending = false;
	}

	function start() {
		stop();
		pending = true;
		timerId = setTimeout(() => {
			pending = false;
			timerId = undefined;
			fn();
		}, delay);
	}

	// Register a cleanup that cancels any in-flight timer when the owning
	// reactive scope (component) is destroyed.
	$effect(() => {
		return () => {
			clearTimer();
		};
	});

	return {
		start,
		stop,
		isPending: () => pending
	};
}

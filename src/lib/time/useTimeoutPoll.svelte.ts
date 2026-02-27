/**
 * Polling utility that chains `setTimeout` calls to repeatedly invoke a
 * function at a given interval, avoiding drift issues inherent in `setInterval`.
 *
 * After each invocation of `fn`, a new timeout is scheduled for the next tick.
 * This means the interval represents the delay *between* the end of one
 * execution and the start of the next, preventing calls from stacking when
 * `fn` takes longer than the interval.
 *
 * The polling must be started manually via `start()`. It is also cleaned up
 * when the owning reactive scope is destroyed.
 *
 * @param fn - Function to invoke on each poll
 * @param interval - Delay in milliseconds between polls
 * @returns Object with `start`, `stop`, and `isActive` functions
 *
 * @example
 * ```ts
 * const { start, stop, isActive } = useTimeoutPoll(() => fetchData(), 5000);
 * start();    // begin polling every 5 seconds
 * isActive(); // → true
 * stop();     // stop polling
 * isActive(); // → false
 * ```
 */
export function useTimeoutPoll(fn: () => void, interval: number) {
	let active = $state(false);
	let timerId: ReturnType<typeof setTimeout> | undefined;

	function clearTimer() {
		if (timerId !== undefined) {
			clearTimeout(timerId);
			timerId = undefined;
		}
	}

	function schedule() {
		timerId = setTimeout(() => {
			if (!active) return;
			fn();
			schedule();
		}, interval);
	}

	function stop() {
		active = false;
		clearTimer();
	}

	function start() {
		if (active) return;
		active = true;
		schedule();
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
		isActive: () => active
	};
}

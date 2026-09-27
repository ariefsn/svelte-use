/**
 * Polls by chaining `setTimeout` calls, avoiding the drift inherent in `setInterval`.
 * The interval is the delay *between* the end of one run and the start of the next.
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

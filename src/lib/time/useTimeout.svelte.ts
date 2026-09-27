export interface UseTimeoutOptions {
	/** If `true`, the timeout starts automatically on initialisation. Default: `true`. */
	immediate?: boolean;
}

/**
 * Schedules a callback after a reactive delay, starting automatically by default.
 * Re-schedules whenever the delay getter returns a new value while running.
 */
export function useTimeout(
	callback: () => void,
	delay: () => number,
	options: UseTimeoutOptions = {}
) {
	const { immediate = true } = options;

	let pending = $state(false);
	// A non-reactive flag so the $effect body can check "should I reschedule?" without reading
	// `pending` — reading it would cycle, since the effect writes `pending` too.
	let running = false;
	let timerId: ReturnType<typeof setTimeout> | undefined;

	function clearTimer() {
		if (timerId !== undefined) {
			clearTimeout(timerId);
			timerId = undefined;
		}
	}

	function scheduleTimer(d: number) {
		timerId = setTimeout(() => {
			running = false;
			pending = false;
			timerId = undefined;
			callback();
		}, d);
	}

	function stop() {
		running = false;
		clearTimer();
		pending = false;
	}

	function start() {
		clearTimer();
		running = true;
		pending = true;
		scheduleTimer(delay());
	}

	// Reactive effect: re-schedules when delay changes (only while running).
	$effect(() => {
		const d = delay();

		if (running) {
			clearTimer();
			scheduleTimer(d);
		}

		return () => {
			clearTimer();
		};
	});

	if (immediate) {
		running = true;
		pending = true;
		scheduleTimer(delay());
	}

	return {
		start,
		stop,
		isPending: () => pending
	};
}

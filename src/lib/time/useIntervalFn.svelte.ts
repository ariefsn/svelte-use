/**
 * Manually-controlled interval. Unlike `useInterval` it does **not** start automatically
 * — call `resume()`. The delay is a plain number, fixed after initialisation.
 */
export function useIntervalFn(fn: () => void, delay: number) {
	let active = $state(false);
	let timerId: ReturnType<typeof setInterval> | undefined;

	function clearTimer() {
		if (timerId !== undefined) {
			clearInterval(timerId);
			timerId = undefined;
		}
	}

	function pause() {
		active = false;
		clearTimer();
	}

	function resume() {
		if (active) return;
		active = true;
		timerId = setInterval(fn, delay);
	}

	// Dependency-free on purpose: it must NOT re-run when `active` changes — a re-run fires the
	// previous teardown first, clearing the interval `resume()` has just created.
	$effect(() => {
		return () => {
			clearTimer();
		};
	});

	return {
		pause,
		resume,
		isActive: () => active
	};
}

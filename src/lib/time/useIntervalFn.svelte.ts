/**
 * Manually-controlled interval utility.
 *
 * Unlike `useInterval`, this composable does **not** start automatically — you
 * must call `resume()` explicitly. The delay is a plain number (not a reactive
 * getter) and does not change after initialisation.
 *
 * The interval is cleared and cleaned up when the owning reactive scope is
 * destroyed.
 *
 * @param fn - Function to invoke on each tick
 * @param delay - Interval delay in milliseconds
 * @returns Object with `pause`, `resume`, and `isActive` functions
 *
 * @example
 * ```ts
 * const { resume, pause, isActive } = useIntervalFn(() => console.log('tick'), 1000);
 * resume();   // starts ticking every 1000ms
 * isActive(); // → true
 * pause();    // stops ticking
 * isActive(); // → false
 * ```
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

	// Dependency-free on purpose: the teardown is registered regardless of
	// whether the effect reads any state, and it must NOT re-run when `active`
	// changes — a re-run fires the previous teardown first, which would clear
	// the interval `resume()` has just created.
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

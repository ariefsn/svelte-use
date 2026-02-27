export interface UseIntervalOptions {
	/** If `true`, the interval starts automatically on initialisation. Default: `true`. */
	immediate?: boolean;
}

/**
 * Reactive interval utility that invokes a callback on a recurring schedule.
 *
 * The interval is automatically restarted whenever the `delay` getter returns
 * a new value. The interval can be paused and resumed at any time. It is
 * cleared and cleaned up when the owning reactive scope is destroyed.
 *
 * SSR-safe: no `window` or browser-specific APIs are used.
 *
 * @param callback - Function to invoke on each tick
 * @param delay - Reactive getter returning the interval delay in milliseconds
 * @param options - Optional configuration
 * @param options.immediate - Whether to start automatically on init (default: `true`)
 * @returns Object with `pause`, `resume`, and `isActive` functions
 *
 * @example
 * ```ts
 * let delay = $state(1000);
 * const { pause, resume, isActive } = useInterval(() => console.log('tick'), () => delay);
 * // ticks every 1000ms
 * pause();   // stops ticking
 * resume();  // resumes ticking
 * delay = 500; // restarts with new interval
 * ```
 */
export function useInterval(
	callback: () => void,
	delay: () => number,
	options: UseIntervalOptions = {}
) {
	const { immediate = true } = options;

	let active = $state(immediate);
	let timerId: ReturnType<typeof setInterval> | undefined;

	function clearTimer() {
		if (timerId !== undefined) {
			clearInterval(timerId);
			timerId = undefined;
		}
	}

	function resume() {
		if (active) return;
		active = true;
		timerId = setInterval(callback, delay());
	}

	function pause() {
		active = false;
		clearTimer();
	}

	$effect(() => {
		const d = delay();

		if (!active) return;

		clearTimer();
		timerId = setInterval(callback, d);

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

/**
 * Reactive countdown timer that decrements at a fixed interval and stops at zero.
 *
 * SSR-safe: no interval is started until `start()` is called. All timers are
 * properly cleaned up on teardown.
 *
 * @param initial - Starting count value (must be a non-negative integer)
 * @param interval - Milliseconds between each decrement (default: `1000`)
 * @returns Object with `count`, `isActive` getters and `start`, `stop`, `reset` functions
 *
 * @example
 * ```ts
 * const { count, isActive, start, stop, reset } = useCountdown(10);
 * start();
 * // After 1 s: count() → 9
 * // After 10 s: count() → 0, isActive() → false
 * reset();
 * // count() → 10, isActive() → false
 * ```
 */
export function useCountdown(
	initial: number,
	interval = 1000
): {
	count: () => number;
	start: () => void;
	stop: () => void;
	reset: () => void;
	isActive: () => boolean;
} {
	let count = $state(initial);
	let active = $state(false);
	let timerId: ReturnType<typeof setInterval> | undefined;

	function clearTimer(): void {
		if (timerId !== undefined) {
			clearInterval(timerId);
			timerId = undefined;
		}
	}

	function start(): void {
		if (active || count <= 0) return;
		active = true;
		timerId = setInterval(() => {
			count -= 1;
			if (count <= 0) {
				count = 0;
				stop();
			}
		}, interval);
	}

	function stop(): void {
		clearTimer();
		active = false;
	}

	function reset(): void {
		stop();
		count = initial;
	}

	$effect(() => {
		return () => {
			clearTimer();
		};
	});

	return {
		get count() {
			return () => count;
		},
		get isActive() {
			return () => active;
		},
		start,
		stop,
		reset
	};
}

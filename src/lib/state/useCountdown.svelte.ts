/**
 * A reactive countdown timer. Counts down from an initial value to zero at a configurable interval.
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

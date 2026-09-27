export interface UseIntervalOptions {
	/** If `true`, the interval starts automatically on initialisation. Default: `true`. */
	immediate?: boolean;
}

/**
 * Invokes a callback on a recurring schedule, starting automatically and pausable at any
 * time. The delay is a reactive getter — changing it restarts the interval.
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

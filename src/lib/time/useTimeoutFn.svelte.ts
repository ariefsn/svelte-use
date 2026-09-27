/**
 * Manually-controlled timeout utility. Unlike `useTimeout`, this composable does **not** start
 * automatically — you must call `start()` explicitly. The timeout fires once, then becomes idle.
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

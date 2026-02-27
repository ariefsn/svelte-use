/**
 * Shape of the return value from {@link useIdle}.
 */
export interface UseIdleReturn {
	/** Getter that returns `true` when the user has been idle for the given timeout. */
	isIdle: () => boolean;
	/** Manually resets the idle timer, marking the user as active again. */
	reset: () => void;
}

const ACTIVITY_EVENTS = [
	'mousemove',
	'mousedown',
	'resize',
	'keydown',
	'touchstart',
	'wheel',
	'pointermove',
	'pointerdown',
	'scroll',
	'visibilitychange'
] as const;

/**
 * Reactive idle-user detector.
 *
 * Listens to a set of user-activity DOM events and marks the user as idle
 * when none of those events have fired within `timeout` milliseconds. The
 * `reset` function can be used to explicitly restart the timer.
 *
 * All event listeners and the pending timer are cleaned up when the
 * reactive scope is destroyed. Safe to call during SSR.
 *
 * @param timeout - Milliseconds of inactivity before `isIdle` becomes `true`.
 * @returns An object with an `isIdle` getter and a `reset` function.
 *
 * @example
 * ```ts
 * const { isIdle, reset } = useIdle(30_000);
 * isIdle(); // false (user is active)
 * reset();  // restart the idle timer
 * ```
 */
export function useIdle(timeout: number): UseIdleReturn {
	const isBrowser = typeof window !== 'undefined';

	let isIdle = $state<boolean>(false);
	let timerId: ReturnType<typeof setTimeout> | undefined;

	function startTimer() {
		clearTimeout(timerId);
		timerId = setTimeout(() => {
			isIdle = true;
		}, timeout);
	}

	function reset() {
		isIdle = false;
		startTimer();
	}

	$effect(() => {
		if (!isBrowser) return;

		function handleActivity() {
			reset();
		}

		startTimer();

		for (const event of ACTIVITY_EVENTS) {
			window.addEventListener(event, handleActivity, { passive: true });
		}

		return () => {
			clearTimeout(timerId);
			for (const event of ACTIVITY_EVENTS) {
				window.removeEventListener(event, handleActivity);
			}
		};
	});

	return {
		isIdle: () => isIdle,
		reset
	};
}

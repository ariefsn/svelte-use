/** Activity events tracked to detect user presence. */
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart'] as const;

/**
 * Detects user idleness by tracking a configurable set of activity events.
 *
 * Returns a reactive getter that is `true` when the user has not triggered
 * any tracked event for at least `timeout` milliseconds. The timer is reset
 * each time an activity event fires. All listeners and the pending timer are
 * removed when the reactive scope is destroyed. Safe to call during SSR.
 *
 * @param timeout - Inactivity threshold in milliseconds (default: `60_000`).
 * @returns A getter function returning `true` when the user is idle.
 *
 * @example
 * ```ts
 * const isIdle = useIdle(30_000);
 * isIdle(); // false – user has been active within the last 30 seconds
 * ```
 */
export function useIdle(timeout = 60_000): () => boolean {
	const isBrowser = typeof window !== 'undefined';

	let idle = $state<boolean>(false);
	let timerId: ReturnType<typeof setTimeout> | undefined;

	function resetTimer(): void {
		clearTimeout(timerId);
		idle = false;
		timerId = setTimeout(() => {
			idle = true;
		}, timeout);
	}

	$effect(() => {
		if (!isBrowser) return;

		resetTimer();

		for (const event of ACTIVITY_EVENTS) {
			window.addEventListener(event, resetTimer, { passive: true });
		}

		return () => {
			clearTimeout(timerId);
			for (const event of ACTIVITY_EVENTS) {
				window.removeEventListener(event, resetTimer);
			}
		};
	});

	return () => idle;
}

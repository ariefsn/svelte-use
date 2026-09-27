/** Activity events tracked to detect user presence. */
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart'] as const;

/**
 * Detects when the user has been idle (no mouse, keyboard, or touch activity) for longer than the
 * specified timeout.
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

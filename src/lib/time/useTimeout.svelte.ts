export interface UseTimeoutOptions {
	/** If `true`, the timeout starts automatically on initialisation. Default: `true`. */
	immediate?: boolean;
}

/**
 * Reactive timeout utility that schedules a callback after a reactive delay.
 *
 * The timeout is automatically re-scheduled whenever the `delay` getter returns
 * a new value while already running. Calling `start()` explicitly reschedules
 * from that point in time. The timeout is cleared and cleaned up when the
 * owning reactive scope is destroyed.
 *
 * SSR-safe: no `window` or browser-specific APIs are used.
 *
 * @param callback - Function to invoke when the timeout fires
 * @param delay - Reactive getter returning the delay in milliseconds
 * @param options - Optional configuration
 * @param options.immediate - Whether to start automatically on init (default: `true`)
 * @returns Object with `start`, `stop`, and `isPending` functions
 *
 * @example
 * ```ts
 * let delay = $state(1000);
 * const { isPending, stop } = useTimeout(() => console.log('fired'), () => delay);
 * // isPending() → true (auto-started)
 * // after 1000ms → callback fires, isPending() → false
 * delay = 500; // reschedules automatically
 * ```
 */
export function useTimeout(
	callback: () => void,
	delay: () => number,
	options: UseTimeoutOptions = {}
) {
	const { immediate = true } = options;

	let pending = $state(false);
	// A non-reactive flag so the $effect body can check "should I reschedule?"
	// without reading `pending` (which would cause a reactive cycle since we
	// also write `pending` inside the effect cleanup and timer callback).
	let running = false;
	let timerId: ReturnType<typeof setTimeout> | undefined;

	function clearTimer() {
		if (timerId !== undefined) {
			clearTimeout(timerId);
			timerId = undefined;
		}
	}

	function scheduleTimer(d: number) {
		timerId = setTimeout(() => {
			running = false;
			pending = false;
			timerId = undefined;
			callback();
		}, d);
	}

	function stop() {
		running = false;
		clearTimer();
		pending = false;
	}

	function start() {
		clearTimer();
		running = true;
		pending = true;
		scheduleTimer(delay());
	}

	// Reactive effect: re-schedules when delay changes (only while running).
	// The teardown always runs clearTimer so that any pending timer — whether
	// started via start() or this effect — is cancelled when the scope is
	// destroyed.
	$effect(() => {
		const d = delay();

		if (running) {
			clearTimer();
			scheduleTimer(d);
		}

		return () => {
			clearTimer();
		};
	});

	if (immediate) {
		running = true;
		pending = true;
		scheduleTimer(delay());
	}

	return {
		start,
		stop,
		isPending: () => pending
	};
}

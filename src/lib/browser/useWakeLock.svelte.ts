export interface UseWakeLockReturn {
	/** Whether the Screen Wake Lock API is supported */
	isSupported: () => boolean;
	/** Whether the wake lock is currently active */
	isActive: () => boolean;
	/** Request a screen wake lock */
	request: () => Promise<void>;
	/** Release the current wake lock */
	release: () => Promise<void>;
}

/**
 * Reactive wrapper around the Screen Wake Lock API.
 *
 * Prevents the device screen from dimming or locking while the wake lock is active.
 *
 * @returns Object with `isSupported`, `isActive`, `request`, and `release`
 *
 * @example
 * ```ts
 * const { isSupported, isActive, request, release } = useWakeLock();
 * await request(); // screen stays on
 * await release(); // allow screen to dim
 * ```
 */
export function useWakeLock(): UseWakeLockReturn {
	const isBrowser = typeof navigator !== 'undefined';
	const supported = isBrowser && 'wakeLock' in navigator;

	let sentinel = $state<WakeLockSentinel | null>(null);
	let active = $state(false);

	async function request() {
		if (!supported || sentinel) return;

		try {
			sentinel = await navigator.wakeLock.request('screen');
			active = true;

			sentinel.addEventListener('release', () => {
				sentinel = null;
				active = false;
			});
		} catch {
			sentinel = null;
			active = false;
		}
	}

	async function release() {
		if (sentinel) {
			await sentinel.release();
			sentinel = null;
			active = false;
		}
	}

	$effect(() => {
		return () => {
			if (sentinel) {
				sentinel.release();
			}
		};
	});

	return {
		isSupported: () => supported,
		isActive: () => active,
		request,
		release
	};
}

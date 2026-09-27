import { useSupported } from './useSupported.svelte.js';

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

/** Prevents the device screen from dimming or locking using the Screen Wake Lock API. */
export function useWakeLock(): UseWakeLockReturn {
	const isSupported = useSupported(() => 'wakeLock' in navigator);

	let sentinel = $state<WakeLockSentinel | null>(null);
	let active = $state(false);
	/*
	 * Plain mirror of `sentinel`. The destroy teardown tracks nothing, and a `$state`
	 * read from there observes a stale value, so it reads this instead.
	 */
	let held: WakeLockSentinel | null = null;

	async function request() {
		if (!isSupported() || sentinel) return;

		try {
			sentinel = await navigator.wakeLock.request('screen');
			held = sentinel;
			active = true;

			sentinel.addEventListener('release', () => {
				sentinel = null;
				held = null;
				active = false;
			});
		} catch {
			sentinel = null;
			held = null;
			active = false;
		}
	}

	async function release() {
		if (sentinel) {
			await sentinel.release();
			sentinel = null;
			held = null;
			active = false;
		}
	}

	$effect(() => {
		return () => {
			if (held) {
				held.release();
				held = null;
			}
		};
	});

	return {
		isSupported,
		isActive: () => active,
		request,
		release
	};
}

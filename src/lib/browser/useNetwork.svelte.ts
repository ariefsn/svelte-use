/**
 * Return value of {@link useNetwork}.
 */
export interface UseNetworkReturn {
	/** Getter returning `true` when the browser reports an active network connection. */
	online: () => boolean;
}

/**
 * Reactive online/offline network status.
 *
 * Listens to the `online` and `offline` events on `window` and reflects the
 * current `navigator.onLine` value. Initial state is read from
 * `navigator.onLine` in the browser and defaults to `true` on the server.
 * Event listeners are removed when the reactive scope is destroyed.
 *
 * Safe to call during SSR.
 *
 * @returns An object with an `online` getter.
 *
 * @example
 * ```ts
 * const { online } = useNetwork();
 * online(); // true | false
 * ```
 */
export function useNetwork(): UseNetworkReturn {
	const isBrowser = typeof window !== 'undefined';

	let online = $state<boolean>(isBrowser ? navigator.onLine : true);

	$effect(() => {
		if (!isBrowser) return;

		function handleOnline(): void {
			online = true;
		}

		function handleOffline(): void {
			online = false;
		}

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	});

	return {
		online: () => online
	};
}

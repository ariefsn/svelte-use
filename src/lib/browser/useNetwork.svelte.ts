/** Return value of {@link useNetwork}. */
export interface UseNetworkReturn {
	/** Getter returning `true` when the browser reports an active network connection. */
	online: () => boolean;
}

/** Reactively tracks online/offline state using the browser `online` and `offline` events. */
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

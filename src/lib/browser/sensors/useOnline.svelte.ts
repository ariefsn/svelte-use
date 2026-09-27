/**
 * Reactive online/offline network status. Tracks `navigator.onLine` and updates on the browser's
 * `online` / `offline` events. Returns `true` during SSR.
 */
export function useOnline(): () => boolean {
	const isBrowser = typeof window !== 'undefined';

	let online = $state<boolean>(isBrowser ? navigator.onLine : true);

	$effect(() => {
		if (!isBrowser) return;

		function handleOnline() {
			online = true;
		}

		function handleOffline() {
			online = false;
		}

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	});

	return () => online;
}

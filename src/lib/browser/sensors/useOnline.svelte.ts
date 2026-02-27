/**
 * Reactive online/offline network status.
 *
 * Tracks `navigator.onLine` and updates reactively on the browser's
 * `online` / `offline` events. Returns `true` during SSR so that
 * server-rendered content assumes connectivity.
 *
 * @returns A getter function that returns `true` when the browser is online.
 *
 * @example
 * ```ts
 * const isOnline = useOnline();
 * isOnline(); // true | false
 * ```
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

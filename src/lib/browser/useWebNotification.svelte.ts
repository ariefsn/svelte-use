import { useSupported } from './useSupported.svelte.js';

export interface UseWebNotificationOptions {
	title?: string;
	body?: string;
	icon?: string;
	tag?: string;
	requireInteraction?: boolean;
	silent?: boolean;
	/** Auto-request permission on creation (default: `true`) */
	autoRequestPermission?: boolean;
}

export interface UseWebNotificationReturn {
	/** Whether the Notification API is supported */
	isSupported: () => boolean;
	/** Whether notification permission is granted */
	isPermissionGranted: () => boolean;
	/** The active Notification instance, or null */
	notification: () => Notification | null;
	/** Last error from `show()`, or `null`. */
	error: () => Error | null;
	/** Shows a notification with optional overrides */
	show: (overrides?: Partial<UseWebNotificationOptions>) => Promise<Notification | null>;
	/** Closes the active notification */
	close: () => void;
}

/** Reactive wrapper around the Web Notifications API for desktop notifications. */
export function useWebNotification(
	options: UseWebNotificationOptions = {}
): UseWebNotificationReturn {
	const isSupported = useSupported(() => 'Notification' in window);
	const { autoRequestPermission = true } = options;

	let permissionGranted = $state(isSupported() ? Notification.permission === 'granted' : false);
	let notification = $state<Notification | null>(null);
	/*
	 * Plain mirror of `notification`. The destroy teardown tracks nothing, and a
	 * `$state` read from there observes a stale value, so it reads this instead.
	 */
	let active: Notification | null = null;
	let error = $state<Error | null>(null);

	/** Reads the live permission rather than the snapshot taken at init. */
	function syncPermission(): boolean {
		if (!isSupported()) return false;
		permissionGranted = Notification.permission === 'granted';
		return permissionGranted;
	}

	if (isSupported() && autoRequestPermission && Notification.permission === 'default') {
		Notification.requestPermission().then((p) => {
			permissionGranted = p === 'granted';
		});
	}

	async function show(
		overrides?: Partial<UseWebNotificationOptions>
	): Promise<Notification | null> {
		error = null;

		if (!isSupported()) {
			error = new Error('The Notification API is not supported in this browser.');
			return null;
		}

		if (Notification.permission === 'default') {
			const result = await Notification.requestPermission();
			permissionGranted = result === 'granted';
		} else {
			// Re-read the live permission: it may have changed since init, and
			// trusting the stale snapshot made show() fail silently.
			syncPermission();
		}

		if (!permissionGranted) {
			error = new Error(`Notification permission is "${Notification.permission}", not "granted".`);
			return null;
		}

		const opts = { ...options, ...overrides };
		close();

		try {
			const n = new Notification(opts.title ?? '', {
				body: opts.body,
				icon: opts.icon,
				tag: opts.tag,
				requireInteraction: opts.requireInteraction,
				silent: opts.silent
			});

			notification = n;
			active = n;
			return n;
		} catch (err) {
			error = err instanceof Error ? err : new Error(String(err));
			return null;
		}
	}

	function close() {
		if (active) {
			active.close();
			active = null;
			notification = null;
		}
	}

	$effect(() => {
		return () => {
			close();
		};
	});

	return {
		isSupported,
		isPermissionGranted: () => permissionGranted,
		notification: () => notification,
		error: () => error,
		show,
		close
	};
}

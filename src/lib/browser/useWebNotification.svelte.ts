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
	/** Shows a notification with optional overrides */
	show: (overrides?: Partial<UseWebNotificationOptions>) => Promise<Notification | null>;
	/** Closes the active notification */
	close: () => void;
}

/**
 * Reactive wrapper around the Web Notifications API.
 *
 * @param options - Default notification options
 * @returns Object with `isSupported`, `isPermissionGranted`, `show`, `close`, `notification`
 *
 * @example
 * ```ts
 * const { isSupported, show, close } = useWebNotification({
 *   title: 'Hello!',
 *   body: 'This is a notification'
 * });
 * await show();
 * ```
 */
export function useWebNotification(
	options: UseWebNotificationOptions = {}
): UseWebNotificationReturn {
	const isBrowser = typeof window !== 'undefined';
	const supported = isBrowser && 'Notification' in window;
	const { autoRequestPermission = true } = options;

	let permissionGranted = $state(supported ? Notification.permission === 'granted' : false);
	let notification = $state<Notification | null>(null);

	if (supported && autoRequestPermission && Notification.permission === 'default') {
		Notification.requestPermission().then((p) => {
			permissionGranted = p === 'granted';
		});
	}

	async function show(
		overrides?: Partial<UseWebNotificationOptions>
	): Promise<Notification | null> {
		if (!supported) return null;

		if (Notification.permission === 'default') {
			const result = await Notification.requestPermission();
			permissionGranted = result === 'granted';
		}

		if (!permissionGranted) return null;

		const opts = { ...options, ...overrides };
		close();

		const n = new Notification(opts.title ?? '', {
			body: opts.body,
			icon: opts.icon,
			tag: opts.tag,
			requireInteraction: opts.requireInteraction,
			silent: opts.silent
		});

		notification = n;
		return n;
	}

	function close() {
		if (notification) {
			notification.close();
			notification = null;
		}
	}

	$effect(() => {
		return () => {
			close();
		};
	});

	return {
		isSupported: () => supported,
		isPermissionGranted: () => permissionGranted,
		notification: () => notification,
		show,
		close
	};
}

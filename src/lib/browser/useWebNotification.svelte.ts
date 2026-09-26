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
	/**
	 * Last error from `show()`, or `null`.
	 *
	 * Note that a `null` error with a non-null {@link notification} means the
	 * notification was constructed successfully — if nothing appeared on
	 * screen the operating system suppressed it (macOS Focus mode, or the
	 * browser disabled in System Settings → Notifications).
	 */
	error: () => Error | null;
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
	let error = $state<Error | null>(null);

	/** Reads the live permission rather than the snapshot taken at init. */
	function syncPermission(): boolean {
		if (!supported) return false;
		permissionGranted = Notification.permission === 'granted';
		return permissionGranted;
	}

	if (supported && autoRequestPermission && Notification.permission === 'default') {
		Notification.requestPermission().then((p) => {
			permissionGranted = p === 'granted';
		});
	}

	async function show(
		overrides?: Partial<UseWebNotificationOptions>
	): Promise<Notification | null> {
		error = null;

		if (!supported) {
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
			return n;
		} catch (err) {
			error = err instanceof Error ? err : new Error(String(err));
			return null;
		}
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
		error: () => error,
		show,
		close
	};
}

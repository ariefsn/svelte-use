export interface UsePermissionReturn {
	/** Whether the Permissions API is supported */
	isSupported: () => boolean;
	/** The current permission state: 'granted', 'denied', or 'prompt' */
	state: () => PermissionState | undefined;
}

/**
 * Reactive wrapper around the Permissions API.
 *
 * Queries and reactively tracks the state of a browser permission.
 *
 * @param name - The permission name to query (e.g., 'camera', 'microphone', 'geolocation')
 * @returns Object with `isSupported` and reactive `state`
 *
 * @example
 * ```ts
 * const { isSupported, state } = usePermission('camera');
 * // state() → 'granted' | 'denied' | 'prompt' | undefined
 * ```
 */
export function usePermission(
	name: PermissionName | (string & {})
): UsePermissionReturn {
	const isBrowser = typeof navigator !== 'undefined';
	const supported = isBrowser && 'permissions' in navigator;

	let state = $state<PermissionState | undefined>(undefined);
	let status: PermissionStatus | undefined;

	function onStateChange() {
		if (status) {
			state = status.state;
		}
	}

	$effect(() => {
		if (!supported) return;

		navigator.permissions
			.query({ name: name as PermissionName })
			.then((s) => {
				status = s;
				state = s.state;
				s.addEventListener('change', onStateChange);
			})
			.catch(() => {
				// Permission name not supported
			});

		return () => {
			if (status) {
				status.removeEventListener('change', onStateChange);
			}
		};
	});

	return {
		isSupported: () => supported,
		state: () => state
	};
}

import { useSupported } from './useSupported.svelte.js';

export interface UsePermissionReturn {
	/** Whether the Permissions API is supported */
	isSupported: () => boolean;
	/** The current permission state: 'granted', 'denied', or 'prompt' */
	state: () => PermissionState | undefined;
}

/** Reactive wrapper around the Permissions API to query browser permission states. */
export function usePermission(name: PermissionName | (string & {})): UsePermissionReturn {
	const isSupported = useSupported(() => 'permissions' in navigator);

	let state = $state<PermissionState | undefined>(undefined);
	let status: PermissionStatus | undefined;

	function onStateChange() {
		if (status) {
			state = status.state;
		}
	}

	$effect(() => {
		if (!isSupported()) return;

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
		isSupported,
		state: () => state
	};
}

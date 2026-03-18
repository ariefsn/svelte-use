export interface UseShareData {
	title?: string;
	text?: string;
	url?: string;
	files?: File[];
}

export interface UseShareReturn {
	/** Whether the Web Share API is supported */
	isSupported: () => boolean;
	/** Triggers the native share dialog */
	share: (data?: UseShareData) => Promise<boolean>;
}

/**
 * Reactive wrapper around the Web Share API.
 *
 * The `share` action must be triggered by a user gesture (e.g., button click).
 *
 * @returns Object with `isSupported` and `share`
 *
 * @example
 * ```ts
 * const { isSupported, share } = useShare();
 * await share({ title: 'Check this out', url: location.href });
 * ```
 */
export function useShare(): UseShareReturn {
	const isBrowser = typeof navigator !== 'undefined';
	const supported = isBrowser && 'share' in navigator;

	async function share(data?: UseShareData): Promise<boolean> {
		if (!supported || !data) return false;

		try {
			await navigator.share(data);
			return true;
		} catch {
			return false;
		}
	}

	return {
		isSupported: () => supported,
		share
	};
}

import { useSupported } from './useSupported.svelte.js';

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

/** Reactive wrapper around the Web Share API for native sharing. */
export function useShare(): UseShareReturn {
	const isSupported = useSupported(() => 'share' in navigator);

	async function share(data?: UseShareData): Promise<boolean> {
		if (!isSupported() || !data) return false;

		try {
			await navigator.share(data);
			return true;
		} catch {
			return false;
		}
	}

	return {
		isSupported,
		share
	};
}

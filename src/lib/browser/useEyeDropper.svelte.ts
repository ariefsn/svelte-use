import { useSupported } from './useSupported.svelte.js';

export interface UseEyeDropperReturn {
	/** Whether the EyeDropper API is supported */
	isSupported: () => boolean;
	/** The most recently picked sRGB hex color, or undefined */
	current: () => string | undefined;
	/** Opens the eye dropper tool. Returns the picked color or undefined if cancelled. */
	open: (options?: { signal?: AbortSignal }) => Promise<string | undefined>;
}

/** Reactive wrapper around the EyeDropper API for picking colors from the screen. */
export function useEyeDropper(options?: { initialValue?: string }): UseEyeDropperReturn {
	const isSupported = useSupported(() => 'EyeDropper' in window);

	let current = $state<string | undefined>(options?.initialValue);

	async function open(opts?: { signal?: AbortSignal }): Promise<string | undefined> {
		if (!isSupported()) return undefined;

		try {
			// @ts-expect-error EyeDropper is not in all TS libs
			const dropper = new window.EyeDropper();
			const result = await dropper.open(opts);
			current = result.sRGBHex;
			return result.sRGBHex;
		} catch {
			return undefined;
		}
	}

	return {
		isSupported,
		current: () => current,
		open
	};
}

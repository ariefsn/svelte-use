export interface UseEyeDropperReturn {
	/** Whether the EyeDropper API is supported */
	isSupported: () => boolean;
	/** The most recently picked sRGB hex color, or undefined */
	current: () => string | undefined;
	/** Opens the eye dropper tool. Returns the picked color or undefined if cancelled. */
	open: (options?: { signal?: AbortSignal }) => Promise<string | undefined>;
}

/**
 * Reactive wrapper around the EyeDropper API for picking colors from the screen.
 *
 * @param options - Optional initial color value
 * @returns Object with `isSupported`, `current`, and `open`
 *
 * @example
 * ```ts
 * const { isSupported, current, open } = useEyeDropper();
 * const color = await open();
 * // current() → '#ff0000'
 * ```
 */
export function useEyeDropper(options?: {
	initialValue?: string;
}): UseEyeDropperReturn {
	const isBrowser = typeof window !== 'undefined';
	const supported = isBrowser && 'EyeDropper' in window;

	let current = $state<string | undefined>(options?.initialValue);

	async function open(opts?: { signal?: AbortSignal }): Promise<string | undefined> {
		if (!supported) return undefined;

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
		isSupported: () => supported,
		current: () => current,
		open
	};
}

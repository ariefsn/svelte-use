import { useMediaQuery } from './useMediaQuery.svelte.js';

/** Shape of the return value from {@link useBreakpoints}. */
export interface UseBreakpointsReturn {
	/**
	 * Getter that returns an array of keys whose associated min-width media query is currently
	 * matched (i.e. viewport width ≥ breakpoint value).
	 */
	active: () => string[];
	/** Returns `true` if the media query for the given breakpoint key is currently matched. */
	is: (key: string) => boolean;
}

/**
 * Reactive breakpoint matcher. Tracks which named min-width breakpoints are currently matched using
 * `window.matchMedia`. Updates automatically when the viewport is resized.
 */
export function useBreakpoints(breakpoints: Record<string, number>): UseBreakpointsReturn {
	// One useMediaQuery per breakpoint; it owns the matchMedia listener and its
	// cleanup, so there is no MediaQueryList bookkeeping here.
	const matchers = Object.entries(breakpoints).map(([key, value]) => ({
		key,
		matches: useMediaQuery(`(min-width: ${value}px)`)
	}));

	const activeKeys = $derived(matchers.filter((m) => m.matches()).map((m) => m.key));

	return {
		active: () => activeKeys,
		is: (key: string) => activeKeys.includes(key)
	};
}

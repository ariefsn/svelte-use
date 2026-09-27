import { PREFERS_DARK_QUERY } from '../../internal/mediaQueries.js';
import { useMediaQuery } from './useMediaQuery.svelte.js';

/** The media query for the OS dark-mode preference. */
export { PREFERS_DARK_QUERY };

/**
 * Reactively tracks whether the OS requests a dark colour scheme, via `(prefers-color-scheme:
 * dark)`.
 */
export function usePreferredDark(): () => boolean {
	return useMediaQuery(PREFERS_DARK_QUERY);
}

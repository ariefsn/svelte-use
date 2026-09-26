import { PREFERS_DARK_QUERY } from '../../internal/mediaQueries.js';
import { useMediaQuery } from './useMediaQuery.svelte.js';

/**
 * The media query for the OS dark-mode preference.
 *
 * Re-exported here so `usePreferredColorScheme` and `useColorMode` reference
 * one literal rather than three copies of a string a typo would silently
 * break. It lives in a plain module so `colorModeScript` can embed it without
 * importing anything rune-compiled.
 */
export { PREFERS_DARK_QUERY };

/**
 * Reactively tracks whether the OS requests a dark colour scheme.
 *
 * Returns `false` during SSR and until hydration, matching `useMediaQuery`.
 *
 * Not the same as `usePreferredColorScheme() === 'dark'`: a user agent that
 * reports no preference at all yields `false` here and `'no-preference'`
 * there. Use this for a binary decision, that one to tell the two apart.
 *
 * @returns A getter returning whether dark mode is preferred
 *
 * @example
 * ```ts
 * const isDark = usePreferredDark();
 * isDark(); // → true when the OS is set to dark
 * ```
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { usePreferredDark } from '@ariefsn/svelte-use';
 *
 *   const prefersDark = usePreferredDark();
 * </script>
 *
 * <img src={prefersDark() ? '/logo-dark.svg' : '/logo-light.svg'} alt="Logo" />
 * ```
 */
export function usePreferredDark(): () => boolean {
	return useMediaQuery(PREFERS_DARK_QUERY);
}

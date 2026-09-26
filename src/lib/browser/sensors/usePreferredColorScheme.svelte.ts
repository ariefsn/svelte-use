import { useFirstMatchingQuery } from './internal/useFirstMatchingQuery.svelte.js';
import { PREFERS_DARK_QUERY } from './usePreferredDark.svelte.js';

/** Resolved OS colour-scheme preference. */
export type PreferredColorScheme = 'dark' | 'light' | 'no-preference';

/**
 * Reactively tracks the OS colour-scheme preference.
 *
 * Derived from two media queries rather than one, so "the user explicitly
 * prefers light" stays distinguishable from "the user agent reports nothing".
 * Older engines and some embedded webviews match neither query.
 *
 * Returns `'no-preference'` during SSR.
 *
 * @returns A getter returning `'dark'`, `'light'`, or `'no-preference'`
 *
 * @example
 * ```ts
 * const scheme = usePreferredColorScheme();
 * scheme(); // → 'dark' | 'light' | 'no-preference'
 * ```
 *
 * @example
 * ```ts
 * // Fall back to your own default only when the OS has no opinion
 * const scheme = usePreferredColorScheme();
 * const theme = $derived(scheme() === 'no-preference' ? 'dark' : scheme());
 * ```
 */
export function usePreferredColorScheme(): () => PreferredColorScheme {
	return useFirstMatchingQuery(
		[
			{ value: 'dark', query: PREFERS_DARK_QUERY },
			{ value: 'light', query: '(prefers-color-scheme: light)' }
		] as const,
		'no-preference'
	);
}

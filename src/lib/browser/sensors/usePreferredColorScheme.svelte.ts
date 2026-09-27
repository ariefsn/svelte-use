import { useFirstMatchingQuery } from './internal/useFirstMatchingQuery.svelte.js';
import { PREFERS_DARK_QUERY } from './usePreferredDark.svelte.js';

/** Resolved OS colour-scheme preference. */
export type PreferredColorScheme = 'dark' | 'light' | 'no-preference';

/** Reactively tracks the OS colour-scheme preference as `dark`, `light` or `no-preference`. */
export function usePreferredColorScheme(): () => PreferredColorScheme {
	return useFirstMatchingQuery(
		[
			{ value: 'dark', query: PREFERS_DARK_QUERY },
			{ value: 'light', query: '(prefers-color-scheme: light)' }
		] as const,
		'no-preference'
	);
}

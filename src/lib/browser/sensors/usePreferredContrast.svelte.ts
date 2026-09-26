import { useFirstMatchingQuery } from './internal/useFirstMatchingQuery.svelte.js';

/** Resolved OS contrast preference. */
export type PreferredContrast = 'more' | 'less' | 'custom' | 'no-preference';

/**
 * Reactively tracks the OS contrast preference.
 *
 * Combines three media queries. `'custom'` means the user has set a specific
 * colour palette — Windows High Contrast, or forced colours — rather than
 * asking for more or less contrast in general.
 *
 * Order matters: a forced-colours mode often matches `custom` *and* `more`
 * simultaneously, so `custom` is checked last and the more actionable answer
 * wins.
 *
 * Returns `'no-preference'` during SSR.
 *
 * @returns A getter returning `'more'`, `'less'`, `'custom'`, or `'no-preference'`
 *
 * @example
 * ```ts
 * const contrast = usePreferredContrast();
 * contrast(); // → 'more' | 'less' | 'custom' | 'no-preference'
 * ```
 *
 * @example
 * ```ts
 * // Thicken borders when the user asked for more contrast
 * const contrast = usePreferredContrast();
 * const borderWidth = $derived(contrast() === 'more' ? 2 : 1);
 * ```
 */
export function usePreferredContrast(): () => PreferredContrast {
	return useFirstMatchingQuery(
		[
			{ value: 'more', query: '(prefers-contrast: more)' },
			{ value: 'less', query: '(prefers-contrast: less)' },
			{ value: 'custom', query: '(prefers-contrast: custom)' }
		] as const,
		'no-preference'
	);
}

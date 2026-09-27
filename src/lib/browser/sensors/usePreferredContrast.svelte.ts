import { useFirstMatchingQuery } from './internal/useFirstMatchingQuery.svelte.js';

/** Resolved OS contrast preference. */
export type PreferredContrast = 'more' | 'less' | 'custom' | 'no-preference';

/** Reactively tracks the OS contrast preference as `more`, `less`, `custom` or `no-preference`. */
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

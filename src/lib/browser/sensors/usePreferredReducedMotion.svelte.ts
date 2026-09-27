import { useFirstMatchingQuery } from './internal/useFirstMatchingQuery.svelte.js';

/** Resolved OS reduced-motion preference. */
export type PreferredReducedMotion = 'reduce' | 'no-preference';

/** Reactively tracks whether the OS requests reduced motion, as `reduce` or `no-preference`. */
export function usePreferredReducedMotion(): () => PreferredReducedMotion {
	return useFirstMatchingQuery(
		[{ value: 'reduce', query: '(prefers-reduced-motion: reduce)' }] as const,
		'no-preference'
	);
}

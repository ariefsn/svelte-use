import { useFirstMatchingQuery } from './internal/useFirstMatchingQuery.svelte.js';

/** Resolved OS reduced-motion preference. */
export type PreferredReducedMotion = 'reduce' | 'no-preference';

/**
 * Reactively tracks whether the OS requests reduced motion.
 *
 * Returns `'no-preference'` during SSR — the safe default, since animations
 * render normally until the real preference is known.
 *
 * The return is the CSS keyword rather than a boolean, matching the rest of
 * the `usePreferred*` family and the value you would write in a `@media`
 * block.
 *
 * @returns A getter returning `'reduce'` or `'no-preference'`
 *
 * @example
 * ```ts
 * const motion = usePreferredReducedMotion();
 * motion(); // → 'reduce' when the user asked for less motion
 * ```
 *
 * @example
 * ```ts
 * // Skip a transition entirely rather than shortening it
 * const motion = usePreferredReducedMotion();
 * const duration = $derived(motion() === 'reduce' ? 0 : 300);
 * ```
 */
export function usePreferredReducedMotion(): () => PreferredReducedMotion {
	return useFirstMatchingQuery(
		[{ value: 'reduce', query: '(prefers-reduced-motion: reduce)' }] as const,
		'no-preference'
	);
}

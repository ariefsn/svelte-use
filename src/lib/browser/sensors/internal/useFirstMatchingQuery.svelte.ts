import { useMediaQuery } from '../useMediaQuery.svelte.js';

/** A candidate value paired with the media query that selects it. */
export interface QueryCandidate<T extends string> {
	/** The value returned when `query` matches. */
	readonly value: T;
	/** Media query string, evaluated via `useMediaQuery`. */
	readonly query: string;
}

/**
 * Returns the value of the first matching candidate, or `fallback`.
 *
 * The shared shape behind the `usePreferred*` family: one `useMediaQuery` per
 * candidate, folded into a `$derived`. Each query owns its own listener and
 * teardown, so there is no `MediaQueryList` bookkeeping here — the same
 * delegation `useBreakpoints` uses.
 *
 * Candidate order is significant: earlier entries win. During SSR every query
 * reports `false`, so the result is `fallback`.
 *
 * @param candidates - Value/query pairs, highest priority first
 * @param fallback - Returned when no candidate matches
 * @returns A getter returning the winning value, or `fallback`
 *
 * @example
 * ```ts
 * const scheme = useFirstMatchingQuery(
 *   [{ value: 'dark', query: '(prefers-color-scheme: dark)' }] as const,
 *   'no-preference'
 * );
 * ```
 */
export function useFirstMatchingQuery<T extends string, F extends string>(
	candidates: readonly QueryCandidate<T>[],
	fallback: F
): () => T | F {
	const matchers = candidates.map((candidate) => ({
		value: candidate.value,
		matches: useMediaQuery(candidate.query)
	}));

	const current = $derived<T | F>(matchers.find((m) => m.matches())?.value ?? fallback);

	return () => current;
}

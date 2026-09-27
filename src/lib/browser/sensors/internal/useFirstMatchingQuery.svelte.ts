import { useMediaQuery } from '../useMediaQuery.svelte.js';

/** A candidate value paired with the media query that selects it. */
export interface QueryCandidate<T extends string> {
	/** The value returned when `query` matches. */
	readonly value: T;
	/** Media query string, evaluated via `useMediaQuery`. */
	readonly query: string;
}

/** Returns the value of the first matching candidate, or `fallback`. */
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

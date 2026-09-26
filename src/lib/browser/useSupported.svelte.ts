/**
 * Evaluates a feature-detection predicate once, with SSR safety.
 *
 * Replaces the `typeof window !== 'undefined' && 'X' in window` guard that
 * browser composables would otherwise hand-roll. The predicate runs
 * immediately (not in an effect), so the result is available during
 * initialisation and this can be called outside a reactive scope.
 *
 * On the server the predicate is never run and the result is `false`, matching
 * how every browser API behaves there. A predicate that throws is treated as
 * unsupported rather than propagating.
 *
 * Support does not change at runtime, so the returned getter is a stable
 * value rather than reactive state.
 *
 * @param predicate - Feature test, only invoked in a browser
 * @returns A getter returning whether the feature is available
 *
 * @example
 * ```ts
 * const isSupported = useSupported(() => 'geolocation' in navigator);
 * isSupported(); // → true in a browser with geolocation, false during SSR
 * ```
 */
export function useSupported(predicate: () => boolean): () => boolean {
	const supported = evaluate(predicate);
	return () => supported;
}

function evaluate(predicate: () => boolean): boolean {
	if (typeof window === 'undefined') return false;
	try {
		return Boolean(predicate());
	} catch {
		// Touching some APIs throws in sandboxed or permission-restricted
		// contexts; that is indistinguishable from "unavailable" to a caller.
		return false;
	}
}

/**
 * Evaluates a feature-detection predicate once, with SSR safety. Replaces the `typeof window !==
 * "undefined" && "X" in window` guard that browser composables would otherwise hand-roll.
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

/**
 * A value, or a getter producing it.
 *
 * Accepting both lets a composable take a constant when the caller has one and
 * a getter when the value needs to stay reactive, without two overloads.
 */
export type MaybeGetter<T> = T | (() => T);

/**
 * Normalises a {@link MaybeGetter} to a plain getter.
 *
 * A getter passes through unchanged; anything else is wrapped so the result is
 * always callable. Reading through the returned function inside an `$effect`
 * or `$derived` keeps the caller's reactivity intact.
 *
 * @param value - A value, or a getter returning one
 * @returns A getter for that value
 *
 * @example
 * ```ts
 * const getQuery = toGetter('(min-width: 768px)');
 * getQuery(); // → '(min-width: 768px)'
 * ```
 *
 * @example
 * ```ts
 * let width = $state(768);
 * const getQuery = toGetter(() => `(min-width: ${width}px)`);
 * getQuery(); // re-reads `width` on every call
 * ```
 */
export function toGetter<T>(value: MaybeGetter<T>): () => T {
	// `T` may itself be a function type, so this narrowing is not something
	// TypeScript can do on its own. The cast is to a concrete type, not `any`.
	return typeof value === 'function' ? (value as () => T) : () => value;
}

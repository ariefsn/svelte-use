/**
 * A value, or a getter producing it. Accepting both lets a composable take a constant when the
 * caller has one and a getter when the value must stay reactive, without a second overload.
 */
export type MaybeGetter<T> = T | (() => T);

/** Normalises a {@link MaybeGetter} to a plain getter. */
export function toGetter<T>(value: MaybeGetter<T>): () => T {
	// `T` may itself be a function type, so this narrowing is not something
	// TypeScript can do on its own. The cast is to a concrete type, not `any`.
	return typeof value === 'function' ? (value as () => T) : () => value;
}

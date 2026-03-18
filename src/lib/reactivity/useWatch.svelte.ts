import { untrack } from 'svelte';

/**
 * Watches one or more reactive getters and calls a callback with
 * the current and previous values whenever they change.
 *
 * @param deps - A single getter or array of getter functions to watch
 * @param fn - Callback receiving `(current, previous)` values
 * @param options - Optional config: `runOnMounted` (default: `true`)
 *
 * @example
 * ```ts
 * let count = $state(0);
 * useWatch(() => count, (curr, prev) => {
 *   console.log(`changed from ${prev} to ${curr}`);
 * });
 * ```
 *
 * @example
 * ```ts
 * // Watching multiple values
 * let a = $state(0);
 * let b = $state('');
 * useWatch([() => a, () => b], ([currA, currB], [prevA, prevB]) => {
 *   console.log('values changed');
 * });
 * ```
 */
export function useWatch<T>(
	deps: () => T,
	fn: (current: T, previous: T | undefined) => void,
	options?: { runOnMounted?: boolean }
): void;
export function useWatch<T extends readonly (() => any)[]>(
	deps: [...T],
	fn: (
		current: { [K in keyof T]: ReturnType<T[K]> },
		previous: { [K in keyof T]: ReturnType<T[K]> } | undefined
	) => void,
	options?: { runOnMounted?: boolean }
): void;
export function useWatch(
	deps: (() => any) | (() => any)[],
	fn: (current: any, previous: any) => void,
	options: { runOnMounted?: boolean } = {}
): void {
	const { runOnMounted = true } = options;
	const isArray = Array.isArray(deps);
	let previous: any = undefined;
	let isFirst = true;

	$effect(() => {
		const current = isArray ? (deps as (() => any)[]).map((d) => d()) : (deps as () => any)();

		// untrack the callback to prevent its internal state reads from becoming deps
		untrack(() => {
			if (isFirst) {
				isFirst = false;
				if (runOnMounted) {
					fn(current, undefined);
				}
				previous = isArray ? [...(current as any[])] : current;
				return;
			}

			fn(current, previous);
			previous = isArray ? [...(current as any[])] : current;
		});
	});
}

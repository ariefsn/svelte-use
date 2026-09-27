/* eslint-disable @typescript-eslint/no-explicit-any --
 * `any` appears only in the overload implementation signature; the public overloads infer
 * `current`/`previous` from the dependency getters, so no caller ever sees `any`.
 */
import { untrack } from 'svelte';

/**
 * Watches one or more reactive getters and calls a callback with the current and previous values.
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

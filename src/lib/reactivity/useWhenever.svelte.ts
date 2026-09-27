import { untrack } from 'svelte';

/** Watches a reactive getter and calls the callback only when the value becomes truthy. */
export function useWhenever(
	deps: () => boolean,
	fn: () => void,
	options?: { runOnMounted?: boolean }
): void;
export function useWhenever(
	deps: (() => boolean)[],
	fn: () => void,
	options?: { runOnMounted?: boolean }
): void;
export function useWhenever(
	deps: (() => boolean) | (() => boolean)[],
	fn: () => void,
	options: { runOnMounted?: boolean } = {}
): void {
	const { runOnMounted = true } = options;
	const isArray = Array.isArray(deps);
	let isFirst = true;

	$effect(() => {
		const truthy = isArray
			? (deps as (() => boolean)[]).every((d) => d())
			: (deps as () => boolean)();

		// untrack the callback to prevent its internal state reads from becoming deps
		untrack(() => {
			if (isFirst) {
				isFirst = false;
				if (runOnMounted && truthy) {
					fn();
				}
				return;
			}

			if (truthy) {
				fn();
			}
		});
	});
}

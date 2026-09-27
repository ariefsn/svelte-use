/** Options for `useMemoize`. */
export interface UseMemoizeOptions<TArgs extends readonly unknown[]> {
	/** Builds the cache key from the arguments. Default `(...args) => JSON.stringify(args)`. */
	getKey?: (...args: TArgs) => string;
	/**
	 * Maximum entries to keep, evicting least-recently-used first. Unbounded when omitted — which for
	 * a long-lived component is a leak.
	 */
	max?: number;
}

/** Return value of `useMemoize`. */
export interface UseMemoizeReturn<TArgs extends readonly unknown[], TResult> {
	/** Calls the function, returning a cached result when one exists. */
	(...args: TArgs): TResult;
	/** Calls the function and replaces any cached result. */
	load: (...args: TArgs) => TResult;
	/** Whether a result is cached for these arguments. */
	has: (...args: TArgs) => boolean;
	/** Removes the entry for these arguments. */
	remove: (...args: TArgs) => void;
	/** Empties the cache. */
	clear: () => void;
	/** How many entries are cached. */
	size: () => number;
}

/** Caches a function’s results by its arguments, with optional LRU eviction. */
export function useMemoize<TArgs extends readonly unknown[], TResult>(
	fn: (...args: TArgs) => TResult,
	options: UseMemoizeOptions<TArgs> = {}
): UseMemoizeReturn<TArgs, TResult> {
	const { getKey = (...args: TArgs) => JSON.stringify(args), max } = options;

	/*
	 * A plain Map, not a `SvelteMap`: a reactive one would make every cached value a dependency,
	 * so an LRU eviction would invalidate any `$derived` that calls the memoised function.
	 */
	/* eslint-disable-next-line svelte/prefer-svelte-reactivity -- see above */
	const cache = new Map<string, TResult>();
	let size = $state(0);

	function touch(key: string, value: TResult): void {
		// Re-inserting moves the key to the end, marking it most recent.
		cache.delete(key);
		cache.set(key, value);

		if (max !== undefined && cache.size > max) {
			const oldest = cache.keys().next();
			if (!oldest.done) cache.delete(oldest.value);
		}
		size = cache.size;
	}

	function load(...args: TArgs): TResult {
		const key = getKey(...args);
		const value = fn(...args);
		touch(key, value);
		return value;
	}

	function memoized(...args: TArgs): TResult {
		const key = getKey(...args);
		if (cache.has(key)) {
			const value = cache.get(key) as TResult;
			// A hit counts as a use, so LRU order stays meaningful.
			touch(key, value);
			return value;
		}
		return load(...args);
	}

	return Object.assign(memoized, {
		load,
		has: (...args: TArgs) => cache.has(getKey(...args)),
		remove: (...args: TArgs) => {
			cache.delete(getKey(...args));
			size = cache.size;
		},
		clear: () => {
			cache.clear();
			size = 0;
		},
		size: () => size
	});
}

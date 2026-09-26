/** Options for `useMemoize`. */
export interface UseMemoizeOptions<TArgs extends readonly unknown[]> {
	/**
	 * Builds the cache key from the arguments.
	 *
	 * The default JSON-serialises them, which is correct for plain values but
	 * treats `{ a: 1, b: 2 }` and `{ b: 2, a: 1 }` as different keys, and
	 * cannot represent a `Map` or a class instance. Supply your own when the
	 * arguments are anything but plain data.
	 * @default (...args) => JSON.stringify(args)
	 */
	getKey?: (...args: TArgs) => string;
	/**
	 * Maximum entries to keep, evicting least-recently-used first.
	 * Unbounded when omitted — which for a long-lived component is a leak.
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

/**
 * Caches a function's results by its arguments.
 *
 * For work that is expensive and pure — parsing, formatting, a layout
 * calculation — where the same inputs recur. It is deliberately **not**
 * reactive: `$derived` already memoises reactive computations, and this is for
 * plain function calls that reactivity does not cover.
 *
 * `size()` is reactive so a cache-status display updates, but the cached values
 * themselves are ordinary.
 *
 * Note this caches whatever the function returns, promises included — so an
 * async function is cached as its in-flight promise, which is usually what you
 * want for deduplicating requests, but means a rejection is cached too.
 *
 * @template TArgs - The function's parameters
 * @template TResult - What it returns
 * @param fn - The function to memoise
 * @param options - Key derivation and cache size
 * @returns The memoised function, with cache controls attached
 *
 * @example
 * ```ts
 * const format = useMemoize((iso: string, locale: string) =>
 *   new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(iso))
 * );
 *
 * format('2026-09-26', 'en-GB'); // computed
 * format('2026-09-26', 'en-GB'); // from cache
 * ```
 */
export function useMemoize<TArgs extends readonly unknown[], TResult>(
	fn: (...args: TArgs) => TResult,
	options: UseMemoizeOptions<TArgs> = {}
): UseMemoizeReturn<TArgs, TResult> {
	const { getKey = (...args: TArgs) => JSON.stringify(args), max } = options;

	/*
	 * A Map preserves insertion order, which is what makes LRU eviction a
	 * delete-and-reinsert rather than a separate bookkeeping structure.
	 *
	 * It is deliberately a plain Map, not a `SvelteMap`. A reactive one would
	 * make every cached *value* a dependency, so a `$derived` that calls the
	 * memoised function would re-run whenever any unrelated entry changed —
	 * an LRU eviction would invalidate it. Only `size` is meant to be
	 * reactive, and it is tracked separately below.
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

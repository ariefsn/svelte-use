export interface UseUntilOptions {
	/** Reject after this many milliseconds. Waits forever when omitted. */
	timeout?: number;
	/** Resolve with the current value on timeout instead of rejecting (default: `false`). */
	resolveOnTimeout?: boolean;
}

/** The element type `toContain` accepts for a given container type. */
export type UseUntilItem<T> = T extends string
	? string
	: T extends ReadonlyArray<infer E>
		? E
		: T extends ReadonlySet<infer E>
			? E
			: T extends ReadonlyMap<infer K, infer _V>
				? K
				: never;

export interface UseUntilChain<T> {
	/** Waits until the value is strictly equal to `expected`. */
	toBe(expected: T, options?: UseUntilOptions): Promise<T>;
	/** Waits until the value is truthy. */
	toBeTruthy(options?: UseUntilOptions): Promise<T>;
	/** Waits until the value is falsy. */
	toBeFalsy(options?: UseUntilOptions): Promise<T>;
	/** Waits until the value is `null` or `undefined`. */
	toBeNullish(options?: UseUntilOptions): Promise<T>;
	/** Waits until the value is neither `null` nor `undefined`. */
	toBeDefined(options?: UseUntilOptions): Promise<T>;
	/** Waits until the value is `NaN`. */
	toBeNaN(options?: UseUntilOptions): Promise<T>;
	/** Waits until the value contains `item`. */
	toContain(item: UseUntilItem<T>, options?: UseUntilOptions): Promise<T>;
	/** Waits until the value's `length` or `size` equals `length`. */
	toHaveLength(length: number, options?: UseUntilOptions): Promise<T>;
	/** Waits until `predicate` returns true for the value. */
	toMatch(predicate: (value: T) => boolean, options?: UseUntilOptions): Promise<T>;
	/** Waits until the value changes from what it is now. */
	changed(options?: UseUntilOptions): Promise<T>;
	/** Waits until the value has changed `times` times from what it is now. */
	changedTimes(times: number, options?: UseUntilOptions): Promise<T>;
	/** Inverts every matcher on the chain, e.g. `not.toBe(5)`. */
	readonly not: UseUntilChain<T>;
}

/** Runtime containment check across the common container shapes. */
function contains<V, I>(value: V, item: I): boolean {
	if (typeof value === 'string') return value.includes(String(item));
	if (Array.isArray(value)) return value.includes(item);
	if (value instanceof Set) return value.has(item);
	if (value instanceof Map) return value.has(item);
	return false;
}

/**
 * Length for arrays and strings, size for Set/Map, and `length` for anything else that carries a
 * numeric one (NodeList, FileList, arguments).
 */
function lengthOf<V>(value: V): number | undefined {
	if (typeof value === 'string' || Array.isArray(value)) return value.length;
	if (value instanceof Set || value instanceof Map) return value.size;
	if (typeof value === 'object' && value !== null && 'length' in value) {
		const { length } = value;
		return typeof length === 'number' ? length : undefined;
	}
	return undefined;
}

/** Waits for a reactive value to reach a condition, as a promise. */
export function useUntil<T>(source: () => T): UseUntilChain<T> {
	function watch(predicate: (value: T) => boolean, options: UseUntilOptions = {}): Promise<T> {
		const { timeout, resolveOnTimeout = false } = options;

		return new Promise<T>((resolve, reject) => {
			let settled = false;
			let timer: ReturnType<typeof setTimeout> | undefined;

			function finish(run: () => void) {
				if (settled) return;
				settled = true;
				if (timer !== undefined) clearTimeout(timer);
				// Deferred for two reasons: `stop` is still in its temporal dead zone when the predicate
				// matches on the first run, and tearing a scope down from inside its own effect is unsafe.
				queueMicrotask(() => stop());
				run();
			}

			const stop = $effect.root(() => {
				$effect(() => {
					const value = source();
					if (predicate(value)) finish(() => resolve(value));
				});
			});

			if (settled) return;

			if (timeout !== undefined) {
				timer = setTimeout(() => {
					finish(() => {
						if (resolveOnTimeout) resolve(source());
						else reject(new Error(`useUntil timed out after ${timeout}ms`));
					});
				}, timeout);
			}
		});
	}

	function buildChain(negated: boolean): UseUntilChain<T> {
		/** Applies the chain's polarity to a matcher. */
		const p = (predicate: (value: T) => boolean) =>
			negated ? (value: T) => !predicate(value) : predicate;

		return {
			toBe: (expected, options) =>
				watch(
					p((value) => value === expected),
					options
				),
			toBeTruthy: (options) =>
				watch(
					p((value) => Boolean(value)),
					options
				),
			toBeFalsy: (options) =>
				watch(
					p((value) => !value),
					options
				),
			toBeNullish: (options) =>
				watch(
					p((value) => value === null || value === undefined),
					options
				),
			toBeDefined: (options) =>
				watch(
					p((value) => value !== null && value !== undefined),
					options
				),
			toBeNaN: (options) =>
				watch(
					p((value) => Number.isNaN(value)),
					options
				),
			toContain: (item, options) =>
				watch(
					p((value) => contains(value, item)),
					options
				),
			toHaveLength: (length, options) =>
				watch(
					p((value) => lengthOf(value) === length),
					options
				),
			toMatch: (predicate, options) => watch(p(predicate), options),
			changed: (options) => {
				const initial = source();
				return watch(
					p((value) => value !== initial),
					options
				);
			},
			changedTimes: (times, options) => {
				let previous = source();
				let seen = 0;
				// Counts transitions rather than effect runs, so a write of the
				// same value does not advance the count.
				return watch(
					p((value) => {
						if (value !== previous) {
							previous = value;
							seen++;
						}
						return seen >= times;
					}),
					options
				);
			},
			get not() {
				return buildChain(!negated);
			}
		};
	}

	return buildChain(false);
}

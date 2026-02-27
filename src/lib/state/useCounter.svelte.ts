/**
 * Reactive counter utility.
 *
 * @param initial - Initial counter value (default: `0`)
 * @returns Object with reactive `value`, `inc`, `dec`, and `reset` functions
 *
 * @example
 * ```ts
 * const { value, inc, dec, reset } = useCounter(10);
 * inc();    // value → 11
 * inc(5);   // value → 16
 * dec(3);   // value → 13
 * reset();  // value → 10
 * ```
 */
export function useCounter(initial = 0) {
	let value = $state(initial);

	function inc(delta = 1) {
		value += delta;
	}

	function dec(delta = 1) {
		value -= delta;
	}

	function reset() {
		value = initial;
	}

	return {
		get value() {
			return value;
		},
		inc,
		dec,
		reset
	};
}

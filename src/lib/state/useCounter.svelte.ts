/**
 * A reactive integer counter with increment, decrement, and reset operations. Supports custom step
 * deltas.
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

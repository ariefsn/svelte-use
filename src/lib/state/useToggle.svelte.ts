/**
 * A reactive boolean toggle. Flips between `true` and `false` with a `toggle()` call, or force a
 * specific value with `set()`.
 */
export function useToggle(initial = false) {
	let value = $state(initial);

	function toggle() {
		value = !value;
	}

	function set(v: boolean) {
		value = v;
	}

	return {
		get value() {
			return value;
		},
		toggle,
		set
	};
}

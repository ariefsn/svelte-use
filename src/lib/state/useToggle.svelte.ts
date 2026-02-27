/**
 * Reactive boolean toggle utility.
 *
 * @param initial - Initial boolean value (default: `false`)
 * @returns Object with reactive `value`, `toggle`, and `set` functions
 *
 * @example
 * ```ts
 * const { value, toggle, set } = useToggle();
 * toggle(); // value → true
 * set(false); // value → false
 * ```
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

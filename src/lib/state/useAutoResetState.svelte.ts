/**
 * Creates reactive state that automatically resets to a default value
 * after a specified delay.
 *
 * @param defaultValue - The value to reset to after the delay
 * @param delay - Time in milliseconds before auto-reset (default: `1000`)
 * @returns Object with reactive `value` that auto-resets after each change
 *
 * @example
 * ```ts
 * const message = useAutoResetState('default', 3000);
 * message.value = 'changed'; // resets to 'default' after 3000ms
 * ```
 */
export function useAutoResetState<T>(defaultValue: T, delay = 1000) {
	let inner = $state<T>(defaultValue);
	let timer: ReturnType<typeof setTimeout> | undefined;

	function set(v: T) {
		inner = v;
		clearTimeout(timer);
		timer = setTimeout(() => {
			inner = defaultValue;
		}, delay);
	}

	return {
		get value() {
			return inner;
		},
		set value(v: T) {
			set(v);
		}
	};
}

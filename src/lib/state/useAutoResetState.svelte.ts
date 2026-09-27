/** Creates reactive state that automatically resets to a default value after a specified delay. */
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

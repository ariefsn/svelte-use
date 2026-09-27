/** Creates reactive state with a fallback value when set to null or undefined. */
export function useDefaultState<T>(defaultValue: T, initialValue?: T) {
	let inner = $state<T>(initialValue ?? defaultValue);

	return {
		get value(): T {
			return inner;
		},
		set value(v: T | null | undefined) {
			inner = v ?? defaultValue;
		}
	};
}

/**
 * Creates reactive state that falls back to a default value when set
 * to `null` or `undefined`.
 *
 * @param defaultValue - The fallback value
 * @param initialValue - Optional initial value (defaults to `defaultValue`)
 * @returns Object with reactive `value` that never returns null/undefined
 *
 * @example
 * ```ts
 * const state = useDefaultState('fallback');
 * state.value = 'hello'; // value → 'hello'
 * state.value = null;    // value → 'fallback'
 * state.value = undefined; // value → 'fallback'
 * ```
 */
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

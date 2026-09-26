import {
	useStorage,
	type UseStorageOptions,
	type UseStorageReturn
} from './storage/useStorage.svelte.js';

export type UseLocalStorageOptions<T> = UseStorageOptions<T>;

/**
 * Reactive `localStorage` utility with SSR safety and cross-tab sync.
 *
 * Reads the stored value on initialisation and reactively persists changes
 * back to `localStorage`. On the server (or any non-browser environment) the
 * `initial` value is used and storage writes are skipped.
 *
 * Listens to the `storage` event so that changes made in another tab sharing
 * the same origin are reflected in the reactive value.
 *
 * Custom `serializer` / `deserializer` can be supplied via `options` to handle
 * non-JSON-serialisable values. When omitted, `JSON.stringify` and `JSON.parse`
 * are used. If deserialising fails the `initial` value is used.
 *
 * @param key - `localStorage` key
 * @param initial - Fallback value used when the key is absent or in SSR
 * @param options - Optional custom serialiser / deserialiser pair
 * @returns Object with reactive `value`, a `set` function, and a `remove` function
 *
 * @example
 * ```ts
 * const theme = useLocalStorage('theme', 'light');
 * theme.set('dark'); // persists to localStorage
 * theme.value;       // 'dark'
 * theme.remove();    // removes key from localStorage, value → initial
 * ```
 */
export function useLocalStorage<T>(
	key: string,
	initial: T,
	options: UseLocalStorageOptions<T> = {}
): UseStorageReturn<T> {
	return useStorage(key, initial, 'local', options);
}

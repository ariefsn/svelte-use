import { useStorage, type UseStorageOptions, type UseStorageReturn } from './useStorage.svelte.js';

export type UseSessionStorageOptions<T> = UseStorageOptions<T>;

/**
 * Reactive `sessionStorage` utility with SSR safety and cross-tab sync.
 *
 * Reads the stored value on initialisation and reactively persists changes
 * back to `sessionStorage`. On the server (or any non-browser environment)
 * the `initial` value is used and storage writes are skipped.
 *
 * Listens to the `storage` event so that changes made in another tab sharing
 * the same origin are reflected in the reactive value.
 *
 * Custom `serializer` / `deserializer` can be supplied via `options` to
 * handle non-JSON-serialisable values. When omitted, `JSON.stringify` and
 * `JSON.parse` are used.
 *
 * @param key - `sessionStorage` key
 * @param initial - Fallback value used when the key is absent or in SSR
 * @param options - Optional custom serialiser / deserialiser pair
 * @returns Object with reactive `value`, a `set` function, and a `remove` function
 *
 * @example
 * ```ts
 * const token = useSessionStorage('auth-token', '');
 * token.set('abc123'); // persists to sessionStorage
 * token.value;         // 'abc123'
 * token.remove();      // removes key from sessionStorage, value → initial
 * ```
 */
export function useSessionStorage<T>(
	key: string,
	initial: T,
	options: UseSessionStorageOptions<T> = {}
): UseStorageReturn<T> {
	return useStorage(key, initial, 'session', options);
}

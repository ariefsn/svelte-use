import {
	useStorage,
	type UseStorageOptions,
	type UseStorageReturn
} from './storage/useStorage.svelte.js';

export type UseLocalStorageOptions<T> = UseStorageOptions<T>;

/**
 * Reactive `localStorage` utility with SSR safety. Values are serialised with `JSON.stringify` /
 * `JSON.parse`. Falls back to `initial` in non-browser environments or on parse errors.
 */
export function useLocalStorage<T>(
	key: string,
	initial: T,
	options: UseLocalStorageOptions<T> = {}
): UseStorageReturn<T> {
	return useStorage(key, initial, 'local', options);
}

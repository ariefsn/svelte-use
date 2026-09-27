import { useStorage, type UseStorageOptions, type UseStorageReturn } from './useStorage.svelte.js';

export type UseSessionStorageOptions<T> = UseStorageOptions<T>;

/**
 * Reactive `sessionStorage` utility. Reads the stored value on init, persists changes
 * automatically, and syncs across tabs via the `storage` event.
 */
export function useSessionStorage<T>(
	key: string,
	initial: T,
	options: UseSessionStorageOptions<T> = {}
): UseStorageReturn<T> {
	return useStorage(key, initial, 'session', options);
}

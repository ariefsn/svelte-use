export interface UseSessionStorageOptions<T> {
	/** Custom serialiser. Defaults to `JSON.stringify`. */
	serializer?: (value: T) => string;
	/** Custom deserialiser. Defaults to `JSON.parse`. */
	deserializer?: (raw: string) => T;
}

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
) {
	const isBrowser = typeof window !== 'undefined';

	const serialize = options.serializer ?? ((v: T) => JSON.stringify(v));
	const deserialize = options.deserializer ?? ((raw: string) => JSON.parse(raw) as T);

	function read(): T {
		if (!isBrowser) return initial;
		try {
			const raw = sessionStorage.getItem(key);
			return raw !== null ? deserialize(raw) : initial;
		} catch {
			return initial;
		}
	}

	let value = $state<T>(read());
	let removed = false;

	$effect(() => {
		if (!isBrowser) return;

		function onStorage(event: StorageEvent) {
			if (event.storageArea !== sessionStorage || event.key !== key) return;
			if (event.newValue === null) {
				removed = true;
				value = initial;
			} else {
				removed = false;
				try {
					value = deserialize(event.newValue);
				} catch {
					value = initial;
				}
			}
		}

		window.addEventListener('storage', onStorage);
		return () => window.removeEventListener('storage', onStorage);
	});

	$effect(() => {
		if (!isBrowser) return;
		if (removed) return;
		try {
			sessionStorage.setItem(key, serialize(value));
		} catch {
			// Silently ignore storage errors (quota exceeded, private browsing, etc.)
		}
	});

	function set(v: T) {
		removed = false;
		value = v;
	}

	function remove() {
		if (isBrowser) {
			sessionStorage.removeItem(key);
		}
		removed = true;
		value = initial;
	}

	return {
		get value() {
			return value;
		},
		set,
		remove
	};
}

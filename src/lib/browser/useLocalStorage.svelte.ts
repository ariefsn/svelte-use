export interface UseLocalStorageOptions<T> {
	/** Custom serialiser. Defaults to `JSON.stringify`. */
	serializer?: (value: T) => string;
	/** Custom deserialiser. Defaults to `JSON.parse`. */
	deserializer?: (raw: string) => T;
}

/**
 * Reactive `localStorage` utility with SSR safety and cross-tab sync.
 *
 * Reads the stored value on initialisation and reactively persists changes
 * back to `localStorage`. On the server (or any non-browser environment)
 * the `initial` value is used and storage writes are skipped.
 *
 * Listens to the `storage` event so that changes made in another tab sharing
 * the same origin are reflected in the reactive value.
 *
 * Custom `serializer` / `deserializer` can be supplied via `options` to
 * handle non-JSON-serialisable values. When omitted, `JSON.stringify` and
 * `JSON.parse` are used. If deserialising fails the `initial` value is used.
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
) {
	const isBrowser = typeof window !== 'undefined';

	const serialize = options.serializer ?? ((v: T) => JSON.stringify(v));
	const deserialize = options.deserializer ?? ((raw: string) => JSON.parse(raw) as T);

	function read(): T {
		if (!isBrowser) return initial;
		try {
			const raw = localStorage.getItem(key);
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
			if (event.storageArea !== localStorage || event.key !== key) return;
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
			localStorage.setItem(key, serialize(value));
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
			localStorage.removeItem(key);
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

export interface UseStorageOptions<T> {
	/** Custom serialiser. Defaults to `JSON.stringify`. */
	serializer?: (value: T) => string;
	/** Custom deserialiser. Defaults to `JSON.parse`. */
	deserializer?: (raw: string) => T;
}

export interface UseStorageReturn<T> {
	/** The reactive stored value. */
	readonly value: T;
	/** Writes a new value and persists it. */
	set: (value: T) => void;
	/** Removes the key from storage and resets the value to `initial`. */
	remove: () => void;
}

/** Which Web Storage area to read and write. */
export type StorageArea = 'local' | 'session';

/**
 * Reactive Web Storage utility with SSR safety and cross-tab sync.
 *
 * The shared implementation behind {@link useLocalStorage} and
 * {@link useSessionStorage}; use those unless the area needs to be chosen at
 * runtime.
 *
 * Reads the stored value on initialisation and persists changes back. On the
 * server the `initial` value is used and writes are skipped. A `storage` event
 * listener keeps the value in sync with other tabs on the same origin.
 *
 * Storage access is wrapped throughout: quota errors, disabled cookies and
 * private-mode restrictions degrade to the in-memory value rather than
 * throwing.
 *
 * @param key - Storage key
 * @param initial - Fallback used when the key is absent, unreadable, or in SSR
 * @param area - `'local'` (default) or `'session'`
 * @param options - Optional custom serialiser / deserialiser pair
 * @returns Object with reactive `value`, `set`, and `remove`
 *
 * @example
 * ```ts
 * const theme = useStorage('theme', 'light');
 * theme.set('dark');
 * theme.value;    // 'dark'
 * theme.remove(); // back to 'light'
 * ```
 *
 * @example
 * ```ts
 * // Non-JSON values
 * const seen = useStorage('last-seen', new Date(), 'session', {
 *   serializer: (d) => d.toISOString(),
 *   deserializer: (raw) => new Date(raw)
 * });
 * ```
 */
export function useStorage<T>(
	key: string,
	initial: T,
	area: StorageArea = 'local',
	options: UseStorageOptions<T> = {}
): UseStorageReturn<T> {
	const isBrowser = typeof window !== 'undefined';

	const serialize = options.serializer ?? ((v: T) => JSON.stringify(v));
	const deserialize = options.deserializer ?? ((raw: string) => JSON.parse(raw) as T);

	/**
	 * Resolved lazily rather than captured once: touching `localStorage` can
	 * throw when cookies are blocked, and that must not happen at import time.
	 */
	function getStore(): Storage | null {
		if (!isBrowser) return null;
		try {
			return area === 'session' ? sessionStorage : localStorage;
		} catch {
			return null;
		}
	}

	function read(): T {
		const store = getStore();
		if (!store) return initial;
		try {
			const raw = store.getItem(key);
			return raw !== null ? deserialize(raw) : initial;
		} catch {
			return initial;
		}
	}

	let value = $state<T>(read());
	// Suppresses the write-back effect after remove(), which would otherwise
	// immediately re-create the key it just deleted.
	let removed = false;

	$effect(() => {
		const store = getStore();
		if (!store) return;

		function onStorage(event: StorageEvent) {
			if (event.storageArea !== store || event.key !== key) return;

			if (event.newValue === null) {
				removed = true;
				value = initial;
				return;
			}

			removed = false;
			try {
				value = deserialize(event.newValue);
			} catch {
				value = initial;
			}
		}

		window.addEventListener('storage', onStorage);
		return () => window.removeEventListener('storage', onStorage);
	});

	$effect(() => {
		// Reads `value` deliberately: this effect exists to mirror it into
		// storage on every change. It never writes `value`, so there is no
		// self-triggering cycle.
		const current = value;
		if (removed) return;

		const store = getStore();
		if (!store) return;

		try {
			store.setItem(key, serialize(current));
		} catch {
			// Quota exceeded, or storage disabled mid-session. The reactive
			// value stays correct even when it cannot be persisted.
		}
	});

	function set(next: T) {
		removed = false;
		value = next;
	}

	function remove() {
		const store = getStore();
		if (store) {
			try {
				store.removeItem(key);
			} catch {
				// Nothing actionable; fall through to the in-memory reset.
			}
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

/**
 * Reactive `localStorage` utility with SSR safety.
 *
 * Reads the stored value on initialisation and reactively persists changes
 * back to `localStorage`. On the server (or any non-browser environment)
 * the `initial` value is used and storage writes are skipped.
 *
 * Values are serialised with `JSON.stringify` / `JSON.parse`. If parsing
 * fails the `initial` value is used as a fallback.
 *
 * @param key - `localStorage` key
 * @param initial - Fallback value used when the key is absent or in SSR
 * @returns Object with reactive `value` and a `set` function
 *
 * @example
 * ```ts
 * const theme = useLocalStorage('theme', 'light');
 * theme.set('dark'); // persists to localStorage
 * theme.value;       // 'dark'
 * ```
 */
export function useLocalStorage<T>(key: string, initial: T) {
	const isBrowser = typeof window !== 'undefined';

	function read(): T {
		if (!isBrowser) return initial;
		try {
			const raw = localStorage.getItem(key);
			return raw !== null ? (JSON.parse(raw) as T) : initial;
		} catch {
			return initial;
		}
	}

	let value = $state<T>(read());

	$effect(() => {
		if (!isBrowser) return;
		try {
			localStorage.setItem(key, JSON.stringify(value));
		} catch {
			// Silently ignore storage errors (quota exceeded, private browsing, etc.)
		}
	});

	function set(v: T) {
		value = v;
	}

	return {
		get value() {
			return value;
		},
		set
	};
}

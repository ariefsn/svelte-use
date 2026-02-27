/**
 * Shape of the return value from {@link useBreakpoints}.
 */
export interface UseBreakpointsReturn {
	/**
	 * Getter that returns an array of keys whose associated min-width media
	 * query is currently matched (i.e. viewport width ≥ breakpoint value).
	 */
	active: () => string[];
	/**
	 * Returns `true` if the media query for the given breakpoint key is
	 * currently matched.
	 *
	 * @param key - One of the keys supplied in the `breakpoints` map.
	 */
	is: (key: string) => boolean;
}

/**
 * Reactive breakpoint matcher.
 *
 * Accepts a map of named breakpoints (key → min-width in pixels) and
 * tracks which ones currently match via `window.matchMedia`. The `active`
 * getter returns the list of matching keys; the `is` helper checks a
 * single key.
 *
 * All `MediaQueryList` listeners are removed when the reactive scope is
 * destroyed. Safe to call during SSR – `active` returns `[]` and `is`
 * returns `false`.
 *
 * @param breakpoints - Map of breakpoint names to their min-width pixel values.
 * @returns An object with an `active` getter and an `is` predicate.
 *
 * @example
 * ```ts
 * const bp = useBreakpoints({ sm: 640, md: 768, lg: 1024, xl: 1280 });
 * bp.active(); // ['sm', 'md'] on a 900px viewport
 * bp.is('lg'); // false
 * ```
 */
export function useBreakpoints(breakpoints: Record<string, number>): UseBreakpointsReturn {
	const isBrowser = typeof window !== 'undefined';

	function computeActive(): string[] {
		if (!isBrowser) return [];
		return Object.entries(breakpoints)
			.filter(([, value]) => window.matchMedia(`(min-width: ${value}px)`).matches)
			.map(([key]) => key);
	}

	let activeKeys = $state<string[]>(computeActive());

	$effect(() => {
		if (!isBrowser) return;

		const queries = Object.entries(breakpoints).map(([key, value]) => {
			const mql = window.matchMedia(`(min-width: ${value}px)`);

			function handleChange() {
				activeKeys = computeActive();
			}

			mql.addEventListener('change', handleChange);
			return { mql, handleChange };
		});

		return () => {
			for (const { mql, handleChange } of queries) {
				mql.removeEventListener('change', handleChange);
			}
		};
	});

	return {
		active: () => activeKeys,
		is: (key: string) => activeKeys.includes(key)
	};
}

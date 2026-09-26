import { useSupported } from '../useSupported.svelte.js';

/**
 * Reactively tracks whether a CSS media query matches.
 *
 * The query may be a plain string or a getter; when it is a getter the
 * listener is rebuilt as the query changes. Safe during SSR — no listener is
 * attached and the getter returns `false` until hydration.
 *
 * The listener is removed when the owning reactive scope is destroyed.
 *
 * @param query - Media query string, or a getter returning one
 * @returns A getter returning whether the query currently matches
 *
 * @example
 * ```ts
 * const isWide = useMediaQuery('(min-width: 768px)');
 * isWide(); // → true when the viewport is at least 768px
 * ```
 *
 * @example
 * ```ts
 * // Reactive query
 * let width = $state(768);
 * const matches = useMediaQuery(() => `(min-width: ${width}px)`);
 * ```
 */
export function useMediaQuery(query: string | (() => string)): () => boolean {
	const getQuery = typeof query === 'function' ? query : () => query;
	const isSupported = useSupported(() => typeof window.matchMedia === 'function');

	/**
	 * Read synchronously so the first render already has the right answer —
	 * otherwise every consumer would flash its non-matching branch for one
	 * frame. Returns `false` during SSR, so a server-rendered page reflects
	 * the non-matching state until hydration.
	 */
	function readInitial(): boolean {
		if (!isSupported()) return false;
		try {
			return window.matchMedia(getQuery()).matches;
		} catch {
			return false;
		}
	}

	let matches = $state(readInitial());

	$effect(() => {
		// Read the query first so a reactive query rebuilds the listener.
		const current = getQuery();
		if (!isSupported()) return;

		const mql = window.matchMedia(current);
		matches = mql.matches;

		function onChange(event: MediaQueryListEvent) {
			matches = event.matches;
		}

		mql.addEventListener('change', onChange);

		return () => {
			mql.removeEventListener('change', onChange);
		};
	});

	return () => matches;
}

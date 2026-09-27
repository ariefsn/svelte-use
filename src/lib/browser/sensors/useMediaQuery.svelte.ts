import { useSupported } from '../useSupported.svelte.js';

/**
 * Reactively tracks whether a CSS media query matches. Accepts a plain string or a getter,
 * rebuilding the listener when a reactive query changes.
 */
export function useMediaQuery(query: string | (() => string)): () => boolean {
	const getQuery = typeof query === 'function' ? query : () => query;
	const isSupported = useSupported(() => typeof window.matchMedia === 'function');

	/**
	 * Read synchronously so the first render already has the right answer — otherwise every consumer
	 * would flash its non-matching branch for one frame.
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

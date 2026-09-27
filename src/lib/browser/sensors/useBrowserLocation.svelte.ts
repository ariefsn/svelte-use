/** Shape of the return value from {@link useBrowserLocation}. */
export interface UseBrowserLocationReturn {
	/** Getter for the full URL string (`window.location.href`). */
	href: () => string;
	/** Getter for the URL path portion (`window.location.pathname`). */
	pathname: () => string;
	/** Getter for the query string including `?` (`window.location.search`). */
	search: () => string;
	/** Getter for the URL fragment including `#` (`window.location.hash`). */
	hash: () => string;
}

/**
 * Reactive snapshot of `window.location`. Updates on `popstate` and `hashchange` events, keeping
 * `href`, `pathname`, `search`, and `hash` in sync with navigation.
 */
export function useBrowserLocation(): UseBrowserLocationReturn {
	const isBrowser = typeof window !== 'undefined';

	function snapshot() {
		if (!isBrowser) return { href: '', pathname: '', search: '', hash: '' };
		return {
			href: window.location.href,
			pathname: window.location.pathname,
			search: window.location.search,
			hash: window.location.hash
		};
	}

	let state = $state(snapshot());

	$effect(() => {
		if (!isBrowser) return;

		function handleChange() {
			state = snapshot();
		}

		window.addEventListener('popstate', handleChange);
		window.addEventListener('hashchange', handleChange);

		return () => {
			window.removeEventListener('popstate', handleChange);
			window.removeEventListener('hashchange', handleChange);
		};
	});

	return {
		href: () => state.href,
		pathname: () => state.pathname,
		search: () => state.search,
		hash: () => state.hash
	};
}

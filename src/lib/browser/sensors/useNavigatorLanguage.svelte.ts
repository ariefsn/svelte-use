/**
 * Reactive browser language preference. Returns `navigator.language` as a BCP 47 language tag and
 * updates on `languagechange` events. Falls back to `"en"` during SSR.
 */
export function useNavigatorLanguage(): () => string {
	const isBrowser = typeof navigator !== 'undefined';

	let language = $state<string>(isBrowser ? navigator.language : 'en');

	$effect(() => {
		if (!isBrowser) return;

		function handleChange() {
			language = navigator.language;
		}

		window.addEventListener('languagechange', handleChange);
		return () => window.removeEventListener('languagechange', handleChange);
	});

	return () => language;
}

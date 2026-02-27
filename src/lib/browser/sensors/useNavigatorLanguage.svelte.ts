/**
 * Reactive browser language preference.
 *
 * Returns the current value of `navigator.language` and re-evaluates
 * whenever the browser fires a `languagechange` event. Falls back to
 * `'en'` during SSR.
 *
 * @returns A getter function that returns the current BCP 47 language tag.
 *
 * @example
 * ```ts
 * const language = useNavigatorLanguage();
 * language(); // 'en-US'
 * ```
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

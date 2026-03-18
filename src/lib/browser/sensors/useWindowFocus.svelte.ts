export interface UseWindowFocusReturn {
	/** Whether the window currently has focus */
	focused: () => boolean;
}

/**
 * Reactively tracks whether the browser window has focus.
 *
 * @returns Object with reactive `focused` getter
 *
 * @example
 * ```ts
 * const { focused } = useWindowFocus();
 * // focused() → true when window is focused
 * ```
 */
export function useWindowFocus(): UseWindowFocusReturn {
	const isBrowser = typeof window !== 'undefined';

	let focused = $state(isBrowser ? document.hasFocus() : false);

	$effect(() => {
		if (!isBrowser) return;

		function onFocus() {
			focused = true;
		}

		function onBlur() {
			focused = false;
		}

		window.addEventListener('focus', onFocus);
		window.addEventListener('blur', onBlur);

		return () => {
			window.removeEventListener('focus', onFocus);
			window.removeEventListener('blur', onBlur);
		};
	});

	return {
		focused: () => focused
	};
}

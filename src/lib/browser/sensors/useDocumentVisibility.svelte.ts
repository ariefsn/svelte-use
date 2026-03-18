export interface UseDocumentVisibilityReturn {
	/** The current document visibility state */
	current: () => DocumentVisibilityState;
}

/**
 * Reactively tracks the document visibility state.
 *
 * Useful for pausing animations, stopping API calls, or adjusting behavior
 * when the user switches tabs or minimizes the window.
 *
 * @returns Object with reactive `current` getter ('visible' or 'hidden')
 *
 * @example
 * ```ts
 * const { current } = useDocumentVisibility();
 * // current() → 'visible' | 'hidden'
 * ```
 */
export function useDocumentVisibility(): UseDocumentVisibilityReturn {
	const isBrowser = typeof document !== 'undefined';

	let state = $state<DocumentVisibilityState>(isBrowser ? document.visibilityState : 'visible');

	$effect(() => {
		if (!isBrowser) return;

		function update() {
			state = document.visibilityState;
		}

		document.addEventListener('visibilitychange', update);

		return () => {
			document.removeEventListener('visibilitychange', update);
		};
	});

	return {
		current: () => state
	};
}

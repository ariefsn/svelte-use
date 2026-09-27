export interface UseActiveElementReturn {
	/** The currently focused element, or null */
	current: () => Element | null;
}

/** Tracks the currently focused element in the document. */
export function useActiveElement(): UseActiveElementReturn {
	const isBrowser = typeof document !== 'undefined';

	let active = $state<Element | null>(isBrowser ? document.activeElement : null);

	$effect(() => {
		if (!isBrowser) return;

		function update() {
			active = document.activeElement;
		}

		window.addEventListener('focus', update, true);
		window.addEventListener('blur', update, true);

		return () => {
			window.removeEventListener('focus', update, true);
			window.removeEventListener('blur', update, true);
		};
	});

	return {
		current: () => active
	};
}

/**
 * Tracks whether a specific element currently holds keyboard focus via `focus` and `blur` events.
 */
export function useFocus(target: () => HTMLElement | null | undefined): {
	focused: () => boolean;
} {
	let focused = $state(false);

	$effect(() => {
		if (typeof document === 'undefined') return;

		const el = target();
		if (!el) return;

		function onFocus() {
			focused = true;
		}

		function onBlur() {
			focused = false;
		}

		el.addEventListener('focus', onFocus);
		el.addEventListener('blur', onBlur);

		return () => {
			el.removeEventListener('focus', onFocus);
			el.removeEventListener('blur', onBlur);
			focused = false;
		};
	});

	return {
		focused: () => focused
	};
}

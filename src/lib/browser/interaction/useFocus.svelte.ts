/**
 * Tracks whether `target` currently holds keyboard focus.
 *
 * Attaches `focus` and `blur` listeners to the element returned by `target`.
 * Returns `false` when `target` is nullish or when running in an SSR
 * environment. Listeners are removed on cleanup.
 *
 * @param target - Reactive getter that returns the element to observe
 * @returns Object with a `focused` getter that is `true` while the element has focus
 *
 * @example
 * ```ts
 * let input = $state<HTMLInputElement | null>(null);
 * const { focused } = useFocus(() => input);
 * // focused() → true while input is focused
 * ```
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
		get focused() {
			return focused;
		}
	};
}

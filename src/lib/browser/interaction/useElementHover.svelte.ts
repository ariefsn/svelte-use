/**
 * Tracks whether the pointer is currently hovering over `target`.
 *
 * Attaches `mouseenter` and `mouseleave` listeners to the element returned by
 * `target`. Returns `false` when `target` is nullish or when running in an
 * SSR environment. Listeners are removed on cleanup.
 *
 * @param target - Reactive getter that returns the element to observe
 * @returns Object with a `hovering` getter that is `true` while the pointer is over the element
 *
 * @example
 * ```ts
 * let el = $state<HTMLElement | null>(null);
 * const { hovering } = useElementHover(() => el);
 * // hovering() → true while cursor is over el
 * ```
 */
export function useElementHover(target: () => HTMLElement | null | undefined): {
	hovering: () => boolean;
} {
	let hovering = $state(false);

	$effect(() => {
		if (typeof document === 'undefined') return;

		const el = target();
		if (!el) return;

		function onEnter() {
			hovering = true;
		}

		function onLeave() {
			hovering = false;
		}

		el.addEventListener('mouseenter', onEnter);
		el.addEventListener('mouseleave', onLeave);

		return () => {
			el.removeEventListener('mouseenter', onEnter);
			el.removeEventListener('mouseleave', onLeave);
			hovering = false;
		};
	});

	return {
		get hovering() {
			return hovering;
		}
	};
}

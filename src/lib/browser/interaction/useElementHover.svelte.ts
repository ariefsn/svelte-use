/**
 * Tracks whether the pointer is currently hovering over a specific element via `mouseenter` and
 * `mouseleave` events.
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
		hovering: () => hovering
	};
}

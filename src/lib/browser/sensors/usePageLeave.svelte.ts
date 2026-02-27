/**
 * Reactive page-leave detector.
 *
 * Returns `true` when the mouse cursor exits the browser viewport by
 * listening to the `document` `mouseleave` and `mouseenter` events.
 * Defaults to `false` (cursor is inside the page). Safe to call during
 * SSR – no events will be attached and the getter always returns `false`.
 *
 * All listeners are removed when the reactive scope is destroyed.
 *
 * @returns A getter function that returns `true` when the mouse has left the viewport.
 *
 * @example
 * ```ts
 * const hasLeft = usePageLeave();
 * hasLeft(); // false
 * ```
 */
export function usePageLeave(): () => boolean {
	const isBrowser = typeof document !== 'undefined';

	let hasLeft = $state<boolean>(false);

	$effect(() => {
		if (!isBrowser) return;

		function handleLeave(event: MouseEvent) {
			// Only treat as a viewport leave when the mouse moves outside the
			// document element (relatedTarget is null or outside the document).
			if (event.relatedTarget === null) {
				hasLeft = true;
			}
		}

		function handleEnter(event: MouseEvent) {
			// Only treat as a viewport enter when the mouse comes from outside
			// the document element.
			if (event.relatedTarget === null) {
				hasLeft = false;
			}
		}

		document.documentElement.addEventListener('mouseleave', handleLeave);
		document.documentElement.addEventListener('mouseenter', handleEnter);

		return () => {
			document.documentElement.removeEventListener('mouseleave', handleLeave);
			document.documentElement.removeEventListener('mouseenter', handleEnter);
		};
	});

	return () => hasLeft;
}

/**
 * Detects when the mouse cursor leaves the browser viewport by listening to `document` `mouseleave`
 * / `mouseenter` events. Useful for exit-intent popups or pausing background tasks.
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

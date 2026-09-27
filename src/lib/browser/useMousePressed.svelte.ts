/** Tracks whether any mouse button is currently pressed anywhere in the document. */
export function useMousePressed(): () => boolean {
	let pressed = $state(false);

	function onMouseDown(): void {
		pressed = true;
	}

	function onMouseUp(): void {
		pressed = false;
	}

	$effect(() => {
		if (typeof window === 'undefined') return;

		window.addEventListener('mousedown', onMouseDown);
		window.addEventListener('mouseup', onMouseUp);

		return () => {
			window.removeEventListener('mousedown', onMouseDown);
			window.removeEventListener('mouseup', onMouseUp);
		};
	});

	return () => pressed;
}

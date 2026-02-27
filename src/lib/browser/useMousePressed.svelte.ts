/**
 * Reactive mouse-pressed state tracker.
 *
 * Returns a getter function that is `true` while any mouse button is held
 * down anywhere in the document. State is driven by `mousedown` and `mouseup`
 * events on `window`.
 *
 * Listeners are registered inside a `$effect` and cleaned up automatically
 * when the reactive scope is destroyed. Safe to call in SSR environments —
 * no listeners are registered outside the browser.
 *
 * @returns Getter that returns `true` while a mouse button is pressed
 *
 * @example
 * ```ts
 * const isPressed = useMousePressed();
 *
 * $effect(() => {
 *   if (isPressed()) startDrag();
 * });
 * ```
 */
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

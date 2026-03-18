export interface UseLongPressOptions {
	/** Delay in milliseconds before triggering (default: `500`) */
	delay?: number;
	/** Maximum movement in pixels before cancelling (default: `10`) */
	distanceThreshold?: number;
}

/**
 * Detects long press gestures on an element.
 *
 * @param target - A getter returning the target element
 * @param handler - Callback fired on long press
 * @param options - Configuration for delay and distance threshold
 * @returns A cleanup function
 *
 * @example
 * ```ts
 * let el: HTMLElement;
 * useLongPress(() => el, (e) => {
 *   console.log('long pressed!', e);
 * }, { delay: 800 });
 * ```
 */
export function useLongPress(
	target: () => HTMLElement | null | undefined,
	handler: (e: PointerEvent) => void,
	options: UseLongPressOptions = {}
): () => void {
	const { delay = 500, distanceThreshold = 10 } = options;

	let timer: ReturnType<typeof setTimeout> | undefined;
	let startX = 0;
	let startY = 0;

	function onPointerDown(e: PointerEvent) {
		startX = e.clientX;
		startY = e.clientY;
		clearTimeout(timer);
		timer = setTimeout(() => handler(e), delay);
	}

	function onPointerMove(e: PointerEvent) {
		if (timer === undefined) return;
		const dx = e.clientX - startX;
		const dy = e.clientY - startY;
		if (Math.sqrt(dx * dx + dy * dy) > distanceThreshold) {
			clearTimeout(timer);
			timer = undefined;
		}
	}

	function onPointerUp() {
		clearTimeout(timer);
		timer = undefined;
	}

	function cleanup() {
		const el = target();
		if (!el) return;
		el.removeEventListener('pointerdown', onPointerDown as EventListener);
		el.removeEventListener('pointermove', onPointerMove as EventListener);
		el.removeEventListener('pointerup', onPointerUp);
		el.removeEventListener('pointercancel', onPointerUp);
	}

	$effect(() => {
		const el = target();
		if (!el) return;

		el.addEventListener('pointerdown', onPointerDown as EventListener);
		el.addEventListener('pointermove', onPointerMove as EventListener);
		el.addEventListener('pointerup', onPointerUp);
		el.addEventListener('pointercancel', onPointerUp);

		return () => {
			clearTimeout(timer);
			el.removeEventListener('pointerdown', onPointerDown as EventListener);
			el.removeEventListener('pointermove', onPointerMove as EventListener);
			el.removeEventListener('pointerup', onPointerUp);
			el.removeEventListener('pointercancel', onPointerUp);
		};
	});

	return cleanup;
}

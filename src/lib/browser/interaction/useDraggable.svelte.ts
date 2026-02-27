export interface UseDraggableOptions {
	/** Initial horizontal position in pixels. @default 0 */
	initialX?: number;
	/** Initial vertical position in pixels. @default 0 */
	initialY?: number;
}

/**
 * Makes `target` draggable using pointer events and tracks its position reactively.
 *
 * On `pointerdown` the hook records the offset between the pointer and the
 * element's current position, then updates `x` / `y` on every `pointermove`
 * until `pointerup` or `pointercancel` fires. `setPointerCapture` is used so
 * that the drag continues even when the cursor leaves the element.
 *
 * All listeners are removed on cleanup. The hook is a no-op in SSR
 * environments or when `target` is nullish.
 *
 * @param target - Reactive getter that returns the element to make draggable
 * @param options - Optional initial position
 * @returns Object with reactive `x`, `y`, and `isDragging` getters
 *
 * @example
 * ```ts
 * let el = $state<HTMLElement | null>(null);
 * const { x, y, isDragging } = useDraggable(() => el, { initialX: 100, initialY: 50 });
 * ```
 */
export function useDraggable(
	target: () => HTMLElement | null | undefined,
	options: UseDraggableOptions = {}
): {
	x: () => number;
	y: () => number;
	isDragging: () => boolean;
} {
	let x = $state(options.initialX ?? 0);
	let y = $state(options.initialY ?? 0);
	let isDragging = $state(false);

	$effect(() => {
		if (typeof document === 'undefined') return;

		const el = target();
		if (!el) return;

		let startPointerX = 0;
		let startPointerY = 0;
		let startElX = 0;
		let startElY = 0;

		function onPointerDown(event: PointerEvent) {
			event.preventDefault();
			startPointerX = event.clientX;
			startPointerY = event.clientY;
			startElX = x;
			startElY = y;
			isDragging = true;
			el!.setPointerCapture(event.pointerId);
		}

		function onPointerMove(event: PointerEvent) {
			if (!isDragging) return;
			x = startElX + (event.clientX - startPointerX);
			y = startElY + (event.clientY - startPointerY);
		}

		function onPointerUp() {
			isDragging = false;
		}

		el.addEventListener('pointerdown', onPointerDown);
		el.addEventListener('pointermove', onPointerMove);
		el.addEventListener('pointerup', onPointerUp);
		el.addEventListener('pointercancel', onPointerUp);

		return () => {
			el.removeEventListener('pointerdown', onPointerDown);
			el.removeEventListener('pointermove', onPointerMove);
			el.removeEventListener('pointerup', onPointerUp);
			el.removeEventListener('pointercancel', onPointerUp);
			isDragging = false;
		};
	});

	return {
		get x() {
			return x;
		},
		get y() {
			return y;
		},
		get isDragging() {
			return isDragging;
		}
	};
}

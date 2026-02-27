/** Options for `useMouse`. */
export interface UseMouseOptions {
	/**
	 * Whether to also track touch events.
	 * @default true
	 */
	touch?: boolean;
}

/** Source type of the most recent pointer event. */
export type MouseSourceType = 'mouse' | 'touch' | null;

/**
 * Reactive pointer-position tracker that supports both mouse and touch input.
 *
 * Attaches `mousemove` and (optionally) `touchmove` listeners to `window` and
 * exposes the current pointer coordinates as reactive getters. The `sourceType`
 * getter indicates whether the last update came from a mouse or a touch event.
 *
 * All listeners are removed when the owning reactive scope is destroyed. Safe
 * to call in SSR environments — no listeners are registered outside the
 * browser.
 *
 * @param options - Optional configuration
 * @param options.touch - When `false`, touch events are ignored. Defaults to `true`.
 * @returns Object with reactive `x`, `y`, and `sourceType` getters
 *
 * @example
 * ```ts
 * const { x, y, sourceType } = useMouse();
 *
 * $effect(() => {
 *   console.log(`Pointer at ${x()}, ${y()} via ${sourceType()}`);
 * });
 * ```
 */
export function useMouse(options: UseMouseOptions = {}): {
	x: () => number;
	y: () => number;
	sourceType: () => MouseSourceType;
} {
	const trackTouch = options.touch !== false;

	let x = $state(0);
	let y = $state(0);
	let sourceType = $state<MouseSourceType>(null);

	$effect(() => {
		if (typeof window === 'undefined') return;

		function onMouseMove(event: MouseEvent) {
			x = event.clientX;
			y = event.clientY;
			sourceType = 'mouse';
		}

		function onTouchMove(event: TouchEvent) {
			const touch = event.touches[0];
			if (!touch) return;
			x = touch.clientX;
			y = touch.clientY;
			sourceType = 'touch';
		}

		window.addEventListener('mousemove', onMouseMove, { passive: true });

		if (trackTouch) {
			window.addEventListener('touchmove', onTouchMove, { passive: true });
		}

		return () => {
			window.removeEventListener('mousemove', onMouseMove);
			if (trackTouch) {
				window.removeEventListener('touchmove', onTouchMove);
			}
		};
	});

	return {
		x: () => x,
		y: () => y,
		sourceType: () => sourceType
	};
}

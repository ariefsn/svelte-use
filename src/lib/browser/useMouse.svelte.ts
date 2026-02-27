/** The input device type that triggered the last position update. */
export type MouseSourceType = 'mouse' | 'touch' | null;

/** Options for `useMouse`. */
export interface UseMouseOptions {
	/**
	 * Whether to track `touchmove` events in addition to `mousemove`.
	 * @default true
	 */
	touch?: boolean;
}

/** Return value of `useMouse`. */
export interface UseMouseReturn {
	/** Reactive getter for the current pointer X coordinate (in pixels, relative to viewport). */
	x: () => number;
	/** Reactive getter for the current pointer Y coordinate (in pixels, relative to viewport). */
	y: () => number;
	/**
	 * Reactive getter for the event source type of the last position update.
	 * `null` before any movement is detected.
	 */
	sourceType: () => MouseSourceType;
}

/**
 * Reactive pointer-position tracker.
 *
 * Tracks the current mouse (and optionally touch) position relative to the
 * viewport. All state is exposed via getter functions backed by Svelte 5
 * `$state` runes. Listeners are registered inside a `$effect` and cleaned up
 * automatically when the reactive scope is destroyed.
 *
 * SSR safe — no listeners are registered outside the browser.
 *
 * @param options - Optional configuration
 * @returns Object with reactive getters `x`, `y`, and `sourceType`
 *
 * @example
 * ```ts
 * const mouse = useMouse();
 *
 * $effect(() => {
 *   console.info(`Pointer at (${mouse.x()}, ${mouse.y()}) via ${mouse.sourceType()}`);
 * });
 * ```
 *
 * @example
 * ```ts
 * // Disable touch tracking
 * const mouse = useMouse({ touch: false });
 * ```
 */
export function useMouse(options: UseMouseOptions = {}): UseMouseReturn {
	const trackTouch = options.touch ?? true;

	let x = $state(0);
	let y = $state(0);
	let sourceType = $state<MouseSourceType>(null);

	function onMouseMove(event: MouseEvent): void {
		x = event.clientX;
		y = event.clientY;
		sourceType = 'mouse';
	}

	function onTouchMove(event: TouchEvent): void {
		const touch = event.touches[0];
		if (!touch) return;
		x = touch.clientX;
		y = touch.clientY;
		sourceType = 'touch';
	}

	$effect(() => {
		if (typeof window === 'undefined') return;

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

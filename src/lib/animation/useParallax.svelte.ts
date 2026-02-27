/**
 * Tracks mouse movement and exposes the cursor position as an offset relative
 * to the centre of a target element, scaled by a speed multiplier.
 *
 * The composable attaches a `mousemove` listener to `window` and calculates
 * how far the cursor is from the midpoint of the bounding box of the given
 * element. This offset can be used to drive CSS transforms for parallax-style
 * depth effects.
 *
 * The listener is removed automatically when the owning component is destroyed
 * or when `target` changes.
 *
 * @param target - Reactive getter that returns the reference element, or
 *   `null`/`undefined` when unavailable.
 * @param options - Optional configuration object.
 * @param options.speed - Multiplier applied to the raw pixel offset
 *   (default: `0.1`). Negative values invert the direction.
 * @returns An object with two reactive getters:
 *   - `x` – horizontal offset in pixels (multiplied by `speed`).
 *   - `y` – vertical offset in pixels (multiplied by `speed`).
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useParallax } from '$lib/animation/useParallax.svelte.js';
 *
 *   let el = $state<HTMLDivElement | null>(null);
 *   const { x, y } = useParallax(() => el, { speed: 0.05 });
 * </script>
 *
 * <div
 *   bind:this={el}
 *   style:transform="translate({x}px, {y}px)"
 * />
 * ```
 */
export function useParallax(
	target: () => HTMLElement | null | undefined,
	options?: {
		speed?: number;
	}
) {
	const speed = options?.speed ?? 0.1;

	let x = $state(0);
	let y = $state(0);

	$effect(() => {
		const el = target();

		if (typeof window === 'undefined' || !el) {
			x = 0;
			y = 0;
			return;
		}

		function onMouseMove(event: MouseEvent) {
			if (!el) return;

			const rect = el.getBoundingClientRect();
			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;

			x = (event.clientX - centerX) * speed;
			y = (event.clientY - centerY) * speed;
		}

		window.addEventListener('mousemove', onMouseMove);

		return () => {
			window.removeEventListener('mousemove', onMouseMove);
			x = 0;
			y = 0;
		};
	});

	return {
		get x() {
			return x;
		},
		get y() {
			return y;
		}
	};
}

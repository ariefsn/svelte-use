/**
 * Built-in linear easing — identity function `t → t`.
 *
 * @param t - Normalised time value in the range `[0, 1]`.
 * @returns The same value `t`.
 */
export function linear(t: number): number {
	return t;
}

/**
 * Cubic ease-in-out easing function.
 *
 * @param t - Normalised time value in the range `[0, 1]`.
 * @returns Eased value in the range `[0, 1]`.
 */
export function cubicInOut(t: number): number {
	return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Smoothly interpolates a reactive numeric source value using
 * `requestAnimationFrame`.
 *
 * When the source changes the composable animates the displayed value from the
 * previous value to the new target over the configured duration. A pending
 * animation frame is always cancelled before a new one begins, so rapid source
 * changes never cause stacking animations.
 *
 * @param source - Reactive getter that provides the current target number.
 * @param options - Optional configuration object.
 * @param options.duration - Animation duration in milliseconds (default: `300`).
 * @param options.easing - Easing function `(t: number) => number` where `t` is
 *   in the range `[0, 1]` (default: `cubicInOut`).
 * @returns A reactive getter that returns the interpolated value. Read it inside
 *   a reactive context (e.g. a template or `$derived`) to receive live updates.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useTransition } from '$lib/animation/useTransition.svelte.js';
 *
 *   let target = $state(0);
 *   const displayed = useTransition(() => target, { duration: 500 });
 * </script>
 *
 * <p>{displayed().toFixed(2)}</p>
 * <button onclick={() => (target = 100)}>Animate to 100</button>
 * ```
 */
export function useTransition(
	source: () => number,
	options?: {
		duration?: number;
		easing?: (t: number) => number;
	}
): () => number {
	const duration = options?.duration ?? 300;
	const easing = options?.easing ?? cubicInOut;

	let current = $state(source());
	let rafId: number | null = null;

	function cancelFrame() {
		if (rafId !== null && typeof cancelAnimationFrame !== 'undefined') {
			cancelAnimationFrame(rafId);
			rafId = null;
		}
	}

	$effect(() => {
		const to = source();

		if (typeof requestAnimationFrame === 'undefined') {
			// SSR: jump directly to the target value with no animation.
			current = to;
			return;
		}

		const from = current;

		if (from === to) return;

		cancelFrame();

		const startTime = performance.now();

		function tick(now: number) {
			const elapsed = now - startTime;
			const t = Math.min(elapsed / duration, 1);
			current = from + (to - from) * easing(t);

			if (t < 1) {
				rafId = requestAnimationFrame(tick);
			} else {
				rafId = null;
			}
		}

		rafId = requestAnimationFrame(tick);

		return () => {
			cancelFrame();
		};
	});

	return () => current;
}

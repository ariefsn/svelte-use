import { untrack } from 'svelte';
/** Smoothly interpolates a reactive numeric source value using `requestAnimationFrame`. */
export function linear(t: number): number {
	return t;
}

/** Smoothly interpolates a reactive numeric source value using `requestAnimationFrame`. */
export function cubicInOut(t: number): number {
	return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Smoothly interpolates a reactive numeric source value using `requestAnimationFrame`. */
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

		// Snapshot, not a dependency.
		const from = untrack(() => current);

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

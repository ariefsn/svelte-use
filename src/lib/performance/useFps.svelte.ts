import { useRafFn } from '../animation/useRafFn.svelte.js';

/**
 * Measures the current frames-per-second rate using `requestAnimationFrame`.
 *
 * Starts a lightweight RAF loop on mount and samples the elapsed time between
 * successive frames to compute a rolling FPS value. The loop is cancelled when
 * the reactive scope is destroyed. Returns `0` during SSR where
 * `requestAnimationFrame` is unavailable.
 *
 * @returns A getter function returning the current FPS as a number.
 *
 * @example
 * ```ts
 * const fps = useFps();
 * fps(); // e.g. 60
 * ```
 */
export function useFps(): () => number {
	let fps = $state<number>(0);

	useRafFn(({ delta }) => {
		// delta is 0 on the first frame, where there is no interval to measure.
		if (delta > 0) fps = Math.round(1000 / delta);
	});

	return () => fps;
}

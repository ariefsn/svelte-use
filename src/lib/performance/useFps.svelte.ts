import { useRafFn } from '../animation/useRafFn.svelte.js';

/**
 * Tracks the current frames-per-second rate of the browser rendering loop using
 * `requestAnimationFrame`.
 */
export function useFps(): () => number {
	let fps = $state<number>(0);

	useRafFn(({ delta }) => {
		// delta is 0 on the first frame, where there is no interval to measure.
		if (delta > 0) fps = Math.round(1000 / delta);
	});

	return () => fps;
}

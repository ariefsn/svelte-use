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
	const isBrowser = typeof requestAnimationFrame !== 'undefined';

	let fps = $state<number>(0);
	let rafId: number | undefined;
	let lastTime: number | undefined;

	$effect(() => {
		if (!isBrowser) return;

		function loop(timestamp: number): void {
			if (lastTime !== undefined) {
				const delta = timestamp - lastTime;
				fps = delta > 0 ? Math.round(1000 / delta) : 0;
			}
			lastTime = timestamp;
			rafId = requestAnimationFrame(loop);
		}

		rafId = requestAnimationFrame(loop);

		return () => {
			if (rafId !== undefined) {
				cancelAnimationFrame(rafId);
			}
			rafId = undefined;
			lastTime = undefined;
		};
	});

	return () => fps;
}

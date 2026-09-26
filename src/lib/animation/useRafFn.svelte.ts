import { untrack } from 'svelte';

export interface UseRafFnOptions {
	/** Start the loop immediately (default: `true`). */
	immediate?: boolean;
	/** Cap the callback rate, in frames per second. Unlimited when omitted. */
	fpsLimit?: number;
}

export interface UseRafFnCallbackArgs {
	/** Milliseconds since the previous invocation. `0` on the first frame. */
	delta: number;
	/** The `requestAnimationFrame` timestamp for this frame. */
	timestamp: number;
}

export interface UseRafFnReturn {
	/** Getter returning `true` while the loop is running. */
	isActive: () => boolean;
	/** Stops the loop. Safe to call when already paused. */
	pause: () => void;
	/** Starts the loop. Safe to call when already running. */
	resume: () => void;
}

/**
 * Runs a callback on every animation frame.
 *
 * The callback receives the frame `timestamp` and the `delta` since the
 * previous invocation, which is what animation and FPS measurement need.
 * Optionally throttled with `fpsLimit`.
 *
 * Safe during SSR: no frame is ever requested and `isActive()` stays `false`.
 * The loop is cancelled when the owning reactive scope is destroyed.
 *
 * @param fn - Called once per frame with `{ delta, timestamp }`
 * @param options - `immediate` and `fpsLimit`
 * @returns Object with `isActive`, `pause`, and `resume`
 *
 * @example
 * ```ts
 * const { pause, resume, isActive } = useRafFn(({ delta }) => {
 *   position += velocity * delta;
 * });
 * ```
 *
 * @example
 * ```ts
 * // Throttled to 30fps, started manually
 * const raf = useRafFn(draw, { immediate: false, fpsLimit: 30 });
 * raf.resume();
 * ```
 */
export function useRafFn(
	fn: (args: UseRafFnCallbackArgs) => void,
	options: UseRafFnOptions = {}
): UseRafFnReturn {
	const { immediate = true, fpsLimit } = options;
	const isBrowser = typeof window !== 'undefined';
	const minDelta = fpsLimit && fpsLimit > 0 ? 1000 / fpsLimit : 0;

	let active = $state(false);
	let rafId: number | undefined;
	// `null` means "no frame yet"; a plain 0 sentinel would make the first
	// frame's delta fail the fpsLimit check and skip it.
	let previous: number | null = null;

	function loop(timestamp: number) {
		if (!active) return;

		const isFirstFrame = previous === null;
		const delta = isFirstFrame ? 0 : timestamp - previous!;

		if (isFirstFrame || delta >= minDelta) {
			previous = timestamp;
			fn({ delta, timestamp });
		}

		rafId = requestAnimationFrame(loop);
	}

	function resume() {
		if (!isBrowser || active) return;
		active = true;
		previous = null;
		rafId = requestAnimationFrame(loop);
	}

	function pause() {
		active = false;
		if (rafId !== undefined) {
			cancelAnimationFrame(rafId);
			rafId = undefined;
		}
	}

	$effect(() => {
		// `resume()` reads `active`, so it must be untracked — otherwise this
		// effect depends on state it writes, re-runs on resume, and its own
		// teardown cancels the frame that was just requested.
		if (immediate) untrack(resume);

		return () => {
			pause();
		};
	});

	return {
		isActive: () => active,
		pause,
		resume
	};
}

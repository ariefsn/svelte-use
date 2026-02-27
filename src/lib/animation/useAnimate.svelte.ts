/**
 * Reactive wrapper around the Web Animations API.
 *
 * Attaches an `Animation` to a target element using the provided keyframes and
 * options. The animation is automatically cancelled and re-created whenever the
 * target, keyframes, or options change. The animation is also cancelled when
 * the owning component is destroyed.
 *
 * @param target - Reactive getter that returns the element to animate, or
 *   `null`/`undefined` when the element is not yet available.
 * @param keyframes - Reactive getter that returns the keyframes for the
 *   animation (array form or property-indexed form).
 * @param options - Optional reactive getter that returns
 *   `KeyframeAnimationOptions` such as `duration`, `easing`, `iterations`, etc.
 * @returns Controls for the current animation plus a reactive `isRunning`
 *   getter.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useAnimate } from '$lib/animation/useAnimate.svelte.js';
 *
 *   let el = $state<HTMLDivElement | null>(null);
 *
 *   const { play, pause, cancel, finish, isRunning } = useAnimate(
 *     () => el,
 *     () => [{ opacity: 0 }, { opacity: 1 }],
 *     () => ({ duration: 300, fill: 'forwards' })
 *   );
 * </script>
 *
 * <div bind:this={el} />
 * <button onclick={play}>Play</button>
 * <button onclick={pause}>Pause</button>
 * ```
 */
export function useAnimate(
	target: () => HTMLElement | null | undefined,
	keyframes: () => Keyframe[] | PropertyIndexedKeyframes,
	options?: () => KeyframeAnimationOptions | undefined
): {
	play: () => void;
	pause: () => void;
	cancel: () => void;
	finish: () => void;
	isRunning: () => boolean;
} {
	let animation = $state<Animation | null>(null);

	$effect(() => {
		const el = target();
		const kf = keyframes();
		const opts = options?.();

		if (!el) {
			animation = null;
			return;
		}

		const anim = el.animate(kf, opts);
		anim.pause();
		animation = anim;

		return () => {
			anim.cancel();
			animation = null;
		};
	});

	function play() {
		animation?.play();
	}

	function pause() {
		animation?.pause();
	}

	function cancel() {
		animation?.cancel();
	}

	function finish() {
		animation?.finish();
	}

	function isRunning(): boolean {
		return animation?.playState === 'running';
	}

	return { play, pause, cancel, finish, isRunning };
}

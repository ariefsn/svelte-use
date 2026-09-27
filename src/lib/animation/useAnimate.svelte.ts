/**
 * Reactive wrapper around the Web Animations API. The `Animation` is cancelled and
 * re-created whenever the target, keyframes or options change.
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

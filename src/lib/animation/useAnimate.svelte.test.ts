import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { flushSync } from 'svelte';
import { useAnimate } from './useAnimate.svelte.js';

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

type PlayState = 'idle' | 'running' | 'paused' | 'finished';

function createMockAnimation(): Animation {
	let playState: PlayState = 'paused';

	const mock = {
		get playState(): PlayState {
			return playState;
		},
		play: vi.fn(() => {
			playState = 'running';
		}),
		pause: vi.fn(() => {
			playState = 'paused';
		}),
		cancel: vi.fn(() => {
			playState = 'idle';
		}),
		finish: vi.fn(() => {
			playState = 'finished';
		})
	} as unknown as Animation;

	return mock;
}

function createMockElement() {
	const anim = createMockAnimation();
	const el = {
		animate: vi.fn(() => anim)
	} as unknown as HTMLElement;
	return { el, anim };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useAnimate', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	test('returns control functions', () => {
		const cleanup = $effect.root(() => {
			const controls = useAnimate(
				() => null,
				() => []
			);
			expect(typeof controls.play).toBe('function');
			expect(typeof controls.pause).toBe('function');
			expect(typeof controls.cancel).toBe('function');
			expect(typeof controls.finish).toBe('function');
			expect(typeof controls.isRunning).toBe('function');
		});
		cleanup();
	});

	test('isRunning returns false when target is null', () => {
		const cleanup = $effect.root(() => {
			const { isRunning } = useAnimate(
				() => null,
				() => []
			);
			flushSync();
			expect(isRunning()).toBe(false);
		});
		cleanup();
	});

	test('calls element.animate with keyframes and options when target is provided', () => {
		const { el, anim } = createMockElement();
		const keyframes: Keyframe[] = [{ opacity: '0' }, { opacity: '1' }];
		const opts: KeyframeAnimationOptions = { duration: 300 };

		const cleanup = $effect.root(() => {
			useAnimate(
				() => el,
				() => keyframes,
				() => opts
			);
			flushSync();
			expect(el.animate).toHaveBeenCalledWith(keyframes, opts);
			// Animation starts paused until play() is called.
			expect(anim.pause).toHaveBeenCalled();
		});
		cleanup();
	});

	test('play() transitions animation to running state', () => {
		const { el, anim } = createMockElement();

		const cleanup = $effect.root(() => {
			const { play, isRunning } = useAnimate(
				() => el,
				() => [{ opacity: '0' }, { opacity: '1' }]
			);
			flushSync();
			expect(isRunning()).toBe(false);
			play();
			expect(anim.play).toHaveBeenCalled();
			expect(isRunning()).toBe(true);
		});
		cleanup();
	});

	test('pause() transitions animation to paused state', () => {
		const { el, anim } = createMockElement();

		const cleanup = $effect.root(() => {
			const { play, pause, isRunning } = useAnimate(
				() => el,
				() => [{ opacity: '0' }, { opacity: '1' }]
			);
			flushSync();
			play();
			expect(isRunning()).toBe(true);
			pause();
			expect(anim.pause).toHaveBeenCalledTimes(2); // once on init, once on pause()
			expect(isRunning()).toBe(false);
		});
		cleanup();
	});

	test('cancel() stops the animation', () => {
		const { el, anim } = createMockElement();

		const cleanup = $effect.root(() => {
			const { play, cancel } = useAnimate(
				() => el,
				() => [{ opacity: '0' }, { opacity: '1' }]
			);
			flushSync();
			play();
			cancel();
			expect(anim.cancel).toHaveBeenCalled();
		});
		cleanup();
	});

	test('finish() completes the animation', () => {
		const { el, anim } = createMockElement();

		const cleanup = $effect.root(() => {
			const { play, finish } = useAnimate(
				() => el,
				() => [{ opacity: '0' }, { opacity: '1' }]
			);
			flushSync();
			play();
			finish();
			expect(anim.finish).toHaveBeenCalled();
		});
		cleanup();
	});

	test('cancels previous animation when keyframes change', () => {
		const { el, anim: firstAnim } = createMockElement();
		let keyframes = $state<Keyframe[]>([{ opacity: '0' }]);

		const cleanup = $effect.root(() => {
			useAnimate(
				() => el,
				() => keyframes
			);
			flushSync();
			// Trigger a reactive update by changing keyframes.
			keyframes = [{ opacity: '0' }, { transform: 'scale(1)' }];
			flushSync();
			expect(firstAnim.cancel).toHaveBeenCalled();
		});
		cleanup();
	});

	test('cancels animation on scope destroy (cleanup)', () => {
		const { el, anim } = createMockElement();

		const cleanup = $effect.root(() => {
			useAnimate(
				() => el,
				() => [{ opacity: '0' }, { opacity: '1' }]
			);
			flushSync();
		});

		cleanup();
		expect(anim.cancel).toHaveBeenCalled();
	});

	test('SSR safe — does not throw when target is null', () => {
		expect(() => {
			const cleanup = $effect.root(() => {
				const controls = useAnimate(
					() => undefined,
					() => []
				);
				flushSync();
				// All controls are no-ops when no animation is attached.
				controls.play();
				controls.pause();
				controls.cancel();
				controls.finish();
				expect(controls.isRunning()).toBe(false);
			});
			cleanup();
		}).not.toThrow();
	});

	test('calls element.animate with undefined options when options getter is omitted', () => {
		const { el } = createMockElement();

		const cleanup = $effect.root(() => {
			useAnimate(
				() => el,
				() => [{ opacity: '0' }]
			);
			flushSync();
			expect(el.animate).toHaveBeenCalledWith([{ opacity: '0' }], undefined);
		});
		cleanup();
	});

	test('accepts PropertyIndexedKeyframes format', () => {
		const { el } = createMockElement();
		const propKeyframes: PropertyIndexedKeyframes = { opacity: ['0', '1'] };

		const cleanup = $effect.root(() => {
			useAnimate(
				() => el,
				() => propKeyframes
			);
			flushSync();
			expect(el.animate).toHaveBeenCalledWith(propKeyframes, undefined);
		});
		cleanup();
	});
});

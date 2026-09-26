import { flushSync } from 'svelte';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { useUserMedia } from './useUserMedia.svelte.js';

/**
 * A real camera cannot be opened in headless Chromium, so these stub
 * `navigator.mediaDevices.getUserMedia`. `useSupported` evaluates its probe
 * immediately at construction, so every stub must be installed *before* the
 * composable is created.
 */

class FakeTrack extends EventTarget {
	readyState: MediaStreamTrackState = 'live';
	stop = vi.fn(() => {
		this.readyState = 'ended';
	});

	/** Simulates the browser ending the track on its own. */
	end() {
		this.readyState = 'ended';
		this.dispatchEvent(new Event('ended'));
	}
}

/**
 * A class, not an object literal, because `$state` deep-proxies plain objects
 * — a literal would come back from `stream()` as a Proxy and fail identity
 * checks. A real `MediaStream` is a class instance and is never proxied, so
 * this keeps the fake faithful to what ships.
 */
class FakeStream {
	constructor(private readonly tracks: FakeTrack[]) {}
	getTracks(): FakeTrack[] {
		return this.tracks;
	}
}

function makeStream(tracks: FakeTrack[] = [new FakeTrack()]): MediaStream {
	return new FakeStream(tracks) as unknown as MediaStream;
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe('useUserMedia', () => {
	test('start() acquires a stream and reports it active', async () => {
		const stream = makeStream();
		vi.spyOn(navigator.mediaDevices, 'getUserMedia').mockResolvedValue(stream);

		// `$effect.root` does not await an async callback, so the composable is
		// created inside it and awaited outside — otherwise the assertions run
		// detached and a failure would not fail the test.
		let media!: ReturnType<typeof useUserMedia>;
		const cleanup = $effect.root(() => {
			media = useUserMedia();
		});

		expect(media.isActive()).toBe(false);

		await media.start();
		flushSync();

		expect(media.stream()).toBe(stream);
		expect(media.isActive()).toBe(true);
		expect(media.error()).toBeNull();

		cleanup();
	});

	test('two start() calls in one tick open a single stream', async () => {
		// Two prompts and two camera streams is the failure this prevents.
		const stream = makeStream();
		const getUserMedia = vi.spyOn(navigator.mediaDevices, 'getUserMedia').mockResolvedValue(stream);

		let media!: ReturnType<typeof useUserMedia>;
		const cleanup = $effect.root(() => {
			media = useUserMedia();
		});

		// Both calls in the same tick: the second must join the first request.
		const [first, second] = await Promise.all([media.start(), media.start()]);

		expect(getUserMedia).toHaveBeenCalledTimes(1);
		expect(first).toBe(stream);
		expect(second).toBe(stream);

		cleanup();
	});

	test('a request resolving after stop() is released, not adopted', async () => {
		// Without the generation counter the camera light stays on with
		// nothing referencing the stream.
		const stream = makeStream();
		let settle!: (value: MediaStream) => void;
		vi.spyOn(navigator.mediaDevices, 'getUserMedia').mockReturnValue(
			new Promise<MediaStream>((resolve) => {
				settle = resolve;
			})
		);

		let media!: ReturnType<typeof useUserMedia>;
		const cleanup = $effect.root(() => {
			media = useUserMedia();
		});

		const started = media.start();
		media.stop();
		settle(stream);

		expect(await started).toBeNull();
		flushSync();

		expect(media.stream()).toBeNull();
		expect(stream.getTracks()[0].stop).toHaveBeenCalled();

		cleanup();
	});

	test('clears the stream when its tracks end on their own', async () => {
		const track = new FakeTrack();
		vi.spyOn(navigator.mediaDevices, 'getUserMedia').mockResolvedValue(makeStream([track]));

		let media!: ReturnType<typeof useUserMedia>;
		const cleanup = $effect.root(() => {
			media = useUserMedia();
		});

		await media.start();
		flushSync();
		expect(media.isActive()).toBe(true);

		track.end();
		flushSync();

		expect(media.stream()).toBeNull();
		expect(media.isActive()).toBe(false);

		cleanup();
	});

	test('captures a denied prompt as a DOMException', async () => {
		vi.spyOn(navigator.mediaDevices, 'getUserMedia').mockRejectedValue(
			new DOMException('Permission denied', 'NotAllowedError')
		);

		let media!: ReturnType<typeof useUserMedia>;
		const cleanup = $effect.root(() => {
			media = useUserMedia();
		});

		expect(await media.start()).toBeNull();
		flushSync();

		expect(media.error()?.name).toBe('NotAllowedError');
		expect(media.isActive()).toBe(false);

		cleanup();
	});

	test('stop() stops every track and clears the stream', async () => {
		const track = new FakeTrack();
		vi.spyOn(navigator.mediaDevices, 'getUserMedia').mockResolvedValue(makeStream([track]));

		let media!: ReturnType<typeof useUserMedia>;
		const cleanup = $effect.root(() => {
			media = useUserMedia();
		});

		await media.start();
		flushSync();

		media.stop();
		flushSync();

		expect(track.stop).toHaveBeenCalled();
		expect(media.stream()).toBeNull();

		cleanup();
	});

	test('passes the resolved constraints through to getUserMedia', async () => {
		const getUserMedia = vi
			.spyOn(navigator.mediaDevices, 'getUserMedia')
			.mockResolvedValue(makeStream());

		let media!: ReturnType<typeof useUserMedia>;
		const cleanup = $effect.root(() => {
			media = useUserMedia({ constraints: () => ({ video: { deviceId: 'cam-1' } }) });
		});

		await media.start();
		expect(getUserMedia).toHaveBeenCalledWith({ video: { deviceId: 'cam-1' } });

		cleanup();
	});

	test('maps each flip setting to a CSS transform', () => {
		const cases = [
			['none', 'none'],
			['horizontal', 'scaleX(-1)'],
			['vertical', 'scaleY(-1)'],
			['both', 'scale(-1, -1)']
		] as const;

		for (const [flip, expected] of cases) {
			const cleanup = $effect.root(() => {
				expect(useUserMedia({ flip }).transform()).toBe(expected);
			});
			cleanup();
		}
	});

	test('defaults to no flip', () => {
		const cleanup = $effect.root(() => {
			const camera = useUserMedia();
			expect(camera.flip()).toBe('none');
			expect(camera.transform()).toBe('none');
		});
		cleanup();
	});

	test('a reactive flip updates the transform without reacquiring the stream', async () => {
		// Mirroring changes no pixels, so it must not re-prompt or interrupt
		// capture — that is the whole reason it is a CSS transform.
		const getUserMedia = vi
			.spyOn(navigator.mediaDevices, 'getUserMedia')
			.mockResolvedValue(makeStream());

		let flip = $state<'none' | 'horizontal'>('none');
		let media!: ReturnType<typeof useUserMedia>;
		const cleanup = $effect.root(() => {
			media = useUserMedia({ flip: () => flip });
		});

		await media.start();
		flushSync();
		expect(media.transform()).toBe('none');
		expect(getUserMedia).toHaveBeenCalledTimes(1);

		flip = 'horizontal';
		flushSync();

		expect(media.transform()).toBe('scaleX(-1)');
		expect(media.flip()).toBe('horizontal');
		// Still one call, and the same stream is still live.
		expect(getUserMedia).toHaveBeenCalledTimes(1);
		expect(media.isActive()).toBe(true);

		cleanup();
	});

	test('reports unsupported and resolves null when mediaDevices is absent', async () => {
		const original = Object.getOwnPropertyDescriptor(navigator, 'mediaDevices');
		Object.defineProperty(navigator, 'mediaDevices', { value: undefined, configurable: true });

		try {
			let media!: ReturnType<typeof useUserMedia>;
			const cleanup = $effect.root(() => {
				media = useUserMedia();
			});

			expect(media.isSupported()).toBe(false);
			expect(await media.start()).toBeNull();

			cleanup();
		} finally {
			if (original) Object.defineProperty(navigator, 'mediaDevices', original);
		}
	});
});

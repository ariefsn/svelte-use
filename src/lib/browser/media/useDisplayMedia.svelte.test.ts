import { flushSync } from 'svelte';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { useDisplayMedia } from './useDisplayMedia.svelte.js';

/**
 * Screen capture cannot be exercised for real in headless Chromium — it needs a picker and a user
 * gesture — so `getDisplayMedia` is stubbed.
 */

class FakeTrack extends EventTarget {
	readyState: MediaStreamTrackState = 'live';
	stop = vi.fn(() => {
		this.readyState = 'ended';
	});

	/** What the browser's own "Stop sharing" button does. */
	end() {
		this.readyState = 'ended';
		this.dispatchEvent(new Event('ended'));
	}
}

/** A class, so `$state` does not proxy it — see the note in useUserMedia's tests. */
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

describe('useDisplayMedia', () => {
	test('start() acquires a display stream', async () => {
		const stream = makeStream();
		vi.spyOn(navigator.mediaDevices, 'getDisplayMedia').mockResolvedValue(stream);

		let media!: ReturnType<typeof useDisplayMedia>;
		const cleanup = $effect.root(() => {
			media = useDisplayMedia();
		});

		await media.start();
		flushSync();

		expect(media.stream()).toBe(stream);
		expect(media.isActive()).toBe(true);

		cleanup();
	});

	test('clears the stream when the browser stops the share', async () => {
		// The browser's "Stop sharing" control ends the tracks without telling
		// the page. Without the `ended` listener, isActive() stays true forever.
		const track = new FakeTrack();
		vi.spyOn(navigator.mediaDevices, 'getDisplayMedia').mockResolvedValue(makeStream([track]));

		let media!: ReturnType<typeof useDisplayMedia>;
		const cleanup = $effect.root(() => {
			media = useDisplayMedia();
		});

		await media.start();
		flushSync();
		expect(media.isActive()).toBe(true);

		track.end();
		flushSync();

		expect(media.isActive()).toBe(false);
		expect(media.stream()).toBeNull();

		cleanup();
	});

	test('passes options through to getDisplayMedia', async () => {
		const getDisplayMedia = vi
			.spyOn(navigator.mediaDevices, 'getDisplayMedia')
			.mockResolvedValue(makeStream());

		let media!: ReturnType<typeof useDisplayMedia>;
		const cleanup = $effect.root(() => {
			media = useDisplayMedia({ options: { video: true, audio: false } });
		});

		await media.start();
		expect(getDisplayMedia).toHaveBeenCalledWith({ video: true, audio: false });

		cleanup();
	});

	test('does not re-prompt when reactive options change', async () => {
		// Unlike useUserMedia, a live display stream is never reacquired
		// automatically — that would reopen the picker unprompted.
		const getDisplayMedia = vi
			.spyOn(navigator.mediaDevices, 'getDisplayMedia')
			.mockResolvedValue(makeStream());

		let audio = $state(false);
		let media!: ReturnType<typeof useDisplayMedia>;
		const cleanup = $effect.root(() => {
			media = useDisplayMedia({ options: () => ({ video: true, audio }) });
		});

		await media.start();
		flushSync();
		expect(getDisplayMedia).toHaveBeenCalledTimes(1);

		audio = true;
		flushSync();

		expect(getDisplayMedia).toHaveBeenCalledTimes(1);

		cleanup();
	});

	test('captures a cancelled picker as a DOMException', async () => {
		vi.spyOn(navigator.mediaDevices, 'getDisplayMedia').mockRejectedValue(
			new DOMException('Permission denied', 'NotAllowedError')
		);

		let media!: ReturnType<typeof useDisplayMedia>;
		const cleanup = $effect.root(() => {
			media = useDisplayMedia();
		});

		expect(await media.start()).toBeNull();
		flushSync();

		expect(media.error()?.name).toBe('NotAllowedError');

		cleanup();
	});

	test('reports unsupported when mediaDevices is absent', async () => {
		const original = Object.getOwnPropertyDescriptor(navigator, 'mediaDevices');
		Object.defineProperty(navigator, 'mediaDevices', { value: undefined, configurable: true });

		try {
			let media!: ReturnType<typeof useDisplayMedia>;
			const cleanup = $effect.root(() => {
				media = useDisplayMedia();
			});

			expect(media.isSupported()).toBe(false);
			expect(await media.start()).toBeNull();

			cleanup();
		} finally {
			if (original) Object.defineProperty(navigator, 'mediaDevices', original);
		}
	});
});

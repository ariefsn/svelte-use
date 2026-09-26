import { flushSync, tick } from 'svelte';
import { describe, expect, test, vi } from 'vitest';
import { useImage } from './useImage.svelte.js';

/**
 * Real images, loaded from data URLs — no network, no stubbing, and the
 * browser's own decode path is what runs.
 */

/** A valid 1×1 transparent PNG. */
const PIXEL =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

/** Declared as a PNG but not one, so decoding fails. */
const BROKEN = 'data:image/png;base64,bm90LWFuLWltYWdl';

/** Waits until the load settles, or gives up. */
async function settled(isLoading: () => boolean, timeoutMs = 2000) {
	const deadline = Date.now() + timeoutMs;
	while (isLoading() && Date.now() < deadline) {
		await new Promise((resolve) => setTimeout(resolve, 10));
		flushSync();
	}
	flushSync();
}

describe('useImage', () => {
	test('loads an image and exposes the element', async () => {
		let img!: ReturnType<typeof useImage>;
		const cleanup = $effect.root(() => {
			img = useImage({ src: PIXEL, alt: 'Pixel' });
		});
		flushSync();

		await settled(img.isLoading);

		expect(img.error()).toBeNull();
		expect(img.isReady()).toBe(true);
		expect(img.image()).toBeInstanceOf(HTMLImageElement);
		expect(img.image()?.alt).toBe('Pixel');
		expect(img.isLoading()).toBe(false);

		cleanup();
	});

	test('reports a failure with the URL, since image errors carry no detail', async () => {
		let img!: ReturnType<typeof useImage>;
		const cleanup = $effect.root(() => {
			img = useImage({ src: BROKEN });
		});
		flushSync();

		await settled(img.isLoading);

		expect(img.error()).toBeInstanceOf(Error);
		expect(img.error()?.message).toContain('Failed to load image');
		expect(img.isReady()).toBe(false);
		expect(img.image()).toBeNull();

		cleanup();
	});

	test('reloads when a reactive source changes', async () => {
		let src = $state(PIXEL);
		let img!: ReturnType<typeof useImage>;
		const cleanup = $effect.root(() => {
			img = useImage(() => ({ src }));
		});
		flushSync();

		await settled(img.isLoading);
		expect(img.isReady()).toBe(true);

		src = BROKEN;
		flushSync();
		await settled(img.isLoading);

		expect(img.isReady()).toBe(false);
		expect(img.error()).not.toBeNull();

		cleanup();
	});

	test('clears the previous result while a new source loads', async () => {
		let src = $state(PIXEL);
		let img!: ReturnType<typeof useImage>;
		const cleanup = $effect.root(() => {
			img = useImage(() => ({ src }));
		});
		flushSync();
		await settled(img.isLoading);
		expect(img.isReady()).toBe(true);

		src = BROKEN;
		flushSync();
		// Stale content must not linger while the next one is in flight.
		expect(img.image()).toBeNull();
		expect(img.isLoading()).toBe(true);

		await settled(img.isLoading);
		cleanup();
	});

	test('refresh() loads again', async () => {
		let img!: ReturnType<typeof useImage>;
		const cleanup = $effect.root(() => {
			img = useImage({ src: PIXEL });
		});
		flushSync();
		await settled(img.isLoading);

		const first = img.image();
		img.refresh();
		flushSync();
		await settled(img.isLoading);

		// A fresh element, not the cached one.
		expect(img.image()).not.toBe(first);
		expect(img.isReady()).toBe(true);

		cleanup();
	});

	test('applies attributes before src, so the fetch uses them', async () => {
		// Setting crossOrigin after src can start a fetch with the wrong mode.
		const order: string[] = [];
		const original = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');

		Object.defineProperty(HTMLImageElement.prototype, 'src', {
			configurable: true,
			set(value: string) {
				order.push('src');
				original?.set?.call(this, value);
			},
			get() {
				return original?.get?.call(this);
			}
		});

		const crossOrigin = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'crossOrigin');
		Object.defineProperty(HTMLImageElement.prototype, 'crossOrigin', {
			configurable: true,
			set(value: string | null) {
				order.push('crossOrigin');
				crossOrigin?.set?.call(this, value);
			},
			get() {
				return crossOrigin?.get?.call(this);
			}
		});

		try {
			const cleanup = $effect.root(() => {
				useImage({ src: PIXEL, crossorigin: 'anonymous' });
			});
			flushSync();
			await tick();

			expect(order).toEqual(['crossOrigin', 'src']);
			cleanup();
		} finally {
			if (original) Object.defineProperty(HTMLImageElement.prototype, 'src', original);
			if (crossOrigin) {
				Object.defineProperty(HTMLImageElement.prototype, 'crossOrigin', crossOrigin);
			}
		}
	});

	test('ignores a result that arrives for a superseded source', async () => {
		// Without the generation guard a slow first load could overwrite a
		// faster second one.
		let src = $state(BROKEN);
		let img!: ReturnType<typeof useImage>;
		const cleanup = $effect.root(() => {
			img = useImage(() => ({ src }));
		});
		flushSync();

		// Switch before the first has settled.
		src = PIXEL;
		flushSync();
		await settled(img.isLoading);

		expect(img.isReady()).toBe(true);
		expect(img.error()).toBeNull();

		cleanup();
	});

	test('does not throw when Image is unavailable', () => {
		const original = globalThis.Image;
		vi.stubGlobal('Image', undefined);

		try {
			let img!: ReturnType<typeof useImage>;
			const cleanup = $effect.root(() => {
				img = useImage({ src: PIXEL });
			});
			flushSync();

			expect(img.isReady()).toBe(false);
			expect(img.image()).toBeNull();

			cleanup();
		} finally {
			vi.stubGlobal('Image', original);
		}
	});
});

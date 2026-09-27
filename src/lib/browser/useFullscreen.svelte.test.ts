import { flushSync } from 'svelte';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { useFullscreen } from './useFullscreen.svelte.js';

/**
 * Real fullscreen needs a user gesture, which headless Chromium will not grant, so
 * `requestFullscreen` / `exitFullscreen` are stubbed and `document.fullscreenElement` is faked.
 */

/** Points `document.fullscreenElement` at `element`, as the browser would. */
function setFullscreenElement(element: Element | null) {
	Object.defineProperty(document, 'fullscreenElement', {
		value: element,
		configurable: true,
		writable: true
	});
}

afterEach(() => {
	vi.restoreAllMocks();
	setFullscreenElement(null);
	document.body.innerHTML = '';
});

describe('useFullscreen', () => {
	test('reports support', () => {
		const cleanup = $effect.root(() => {
			expect(useFullscreen().isSupported()).toBe(true);
		});
		cleanup();
	});

	test('enter() requests fullscreen on the target element', async () => {
		const element = document.createElement('div');
		document.body.append(element);

		const request = vi
			.spyOn(element, 'requestFullscreen')
			.mockImplementation(async () => setFullscreenElement(element));

		let fullscreen!: ReturnType<typeof useFullscreen>;
		const cleanup = $effect.root(() => {
			fullscreen = useFullscreen(() => element);
		});
		flushSync();

		expect(fullscreen.isFullscreen()).toBe(false);

		await fullscreen.enter();
		flushSync();

		expect(request).toHaveBeenCalled();
		expect(fullscreen.isFullscreen()).toBe(true);

		cleanup();
	});

	test('defaults to the whole page when given no target', async () => {
		const request = vi
			.spyOn(document.documentElement, 'requestFullscreen')
			.mockImplementation(async () => setFullscreenElement(document.documentElement));

		let fullscreen!: ReturnType<typeof useFullscreen>;
		const cleanup = $effect.root(() => {
			fullscreen = useFullscreen();
		});

		await fullscreen.enter();
		flushSync();

		expect(request).toHaveBeenCalled();
		expect(fullscreen.isFullscreen()).toBe(true);

		cleanup();
	});

	test('is false when a different element is the fullscreen one', () => {
		// What makes per-element toggle buttons behave: someone else going
		// fullscreen must not light up this instance.
		const mine = document.createElement('div');
		const theirs = document.createElement('div');
		document.body.append(mine, theirs);

		let fullscreen!: ReturnType<typeof useFullscreen>;
		const cleanup = $effect.root(() => {
			fullscreen = useFullscreen(() => mine);
		});
		flushSync();

		setFullscreenElement(theirs);
		document.dispatchEvent(new Event('fullscreenchange'));
		flushSync();

		expect(fullscreen.isFullscreen()).toBe(false);

		cleanup();
	});

	test('follows the fullscreenchange event, not the last call', () => {
		// Escape leaves fullscreen without telling the page, so the event is
		// the only trustworthy source.
		const element = document.createElement('div');
		document.body.append(element);

		let fullscreen!: ReturnType<typeof useFullscreen>;
		const cleanup = $effect.root(() => {
			fullscreen = useFullscreen(() => element);
		});
		flushSync();

		setFullscreenElement(element);
		document.dispatchEvent(new Event('fullscreenchange'));
		flushSync();
		expect(fullscreen.isFullscreen()).toBe(true);

		// The user pressed Escape.
		setFullscreenElement(null);
		document.dispatchEvent(new Event('fullscreenchange'));
		flushSync();
		expect(fullscreen.isFullscreen()).toBe(false);

		cleanup();
	});

	test('exit() only acts when this target is the one displayed', async () => {
		const mine = document.createElement('div');
		const theirs = document.createElement('div');
		document.body.append(mine, theirs);

		const exitFullscreen = vi.spyOn(document, 'exitFullscreen').mockResolvedValue();

		let fullscreen!: ReturnType<typeof useFullscreen>;
		const cleanup = $effect.root(() => {
			fullscreen = useFullscreen(() => mine);
		});

		// Someone else's element is fullscreen — leave it alone.
		setFullscreenElement(theirs);
		await fullscreen.exit();
		expect(exitFullscreen).not.toHaveBeenCalled();

		setFullscreenElement(mine);
		await fullscreen.exit();
		expect(exitFullscreen).toHaveBeenCalled();

		cleanup();
	});

	test('toggle() enters when out and exits when in', async () => {
		const element = document.createElement('div');
		document.body.append(element);

		vi.spyOn(element, 'requestFullscreen').mockImplementation(async () =>
			setFullscreenElement(element)
		);
		const exitFullscreen = vi.spyOn(document, 'exitFullscreen').mockImplementation(async () => {
			setFullscreenElement(null);
		});

		let fullscreen!: ReturnType<typeof useFullscreen>;
		const cleanup = $effect.root(() => {
			fullscreen = useFullscreen(() => element);
		});
		flushSync();

		await fullscreen.toggle();
		flushSync();
		expect(fullscreen.isFullscreen()).toBe(true);

		await fullscreen.toggle();
		flushSync();
		expect(exitFullscreen).toHaveBeenCalled();
		expect(fullscreen.isFullscreen()).toBe(false);

		cleanup();
	});

	test('exits fullscreen when the scope is destroyed', async () => {
		// Otherwise navigating away leaves the whole page stuck fullscreen.
		const element = document.createElement('div');
		document.body.append(element);

		const exitFullscreen = vi.spyOn(document, 'exitFullscreen').mockResolvedValue();

		const cleanup = $effect.root(() => {
			useFullscreen(() => element);
		});
		flushSync();

		setFullscreenElement(element);
		cleanup();
		flushSync();

		expect(exitFullscreen).toHaveBeenCalled();
	});

	test('leaves fullscreen alone on destroy when exitOnDestroy is false', () => {
		const element = document.createElement('div');
		document.body.append(element);

		const exitFullscreen = vi.spyOn(document, 'exitFullscreen').mockResolvedValue();

		const cleanup = $effect.root(() => {
			useFullscreen(() => element, { exitOnDestroy: false });
		});
		flushSync();

		setFullscreenElement(element);
		cleanup();
		flushSync();

		expect(exitFullscreen).not.toHaveBeenCalled();
	});

	test('does nothing when the target getter returns null', async () => {
		let fullscreen!: ReturnType<typeof useFullscreen>;
		const cleanup = $effect.root(() => {
			fullscreen = useFullscreen(() => null);
		});

		await expect(fullscreen.enter()).resolves.toBeUndefined();
		expect(fullscreen.isFullscreen()).toBe(false);

		cleanup();
	});
});

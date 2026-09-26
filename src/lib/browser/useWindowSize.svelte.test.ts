import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useWindowSize } from './useWindowSize.svelte.js';

/** Resizes the fake viewport and fires the matching event. */
function resizeTo(width: number, height: number, event = 'resize') {
	Object.defineProperty(window, 'innerWidth', { value: width, configurable: true });
	Object.defineProperty(window, 'innerHeight', { value: height, configurable: true });
	Object.defineProperty(document.documentElement, 'clientWidth', {
		value: width - 15,
		configurable: true
	});
	Object.defineProperty(document.documentElement, 'clientHeight', {
		value: height - 15,
		configurable: true
	});
	window.dispatchEvent(new Event(event));
}

let originalWidth: number;
let originalHeight: number;

beforeEach(() => {
	originalWidth = window.innerWidth;
	originalHeight = window.innerHeight;
});

afterEach(() => {
	Object.defineProperty(window, 'innerWidth', { value: originalWidth, configurable: true });
	Object.defineProperty(window, 'innerHeight', { value: originalHeight, configurable: true });
});

describe('useWindowSize', () => {
	test('measures the viewport once the effect runs', () => {
		const cleanup = $effect.root(() => {
			resizeTo(1280, 720);
			const { width, height } = useWindowSize();
			flushSync();

			expect(width()).toBe(1280);
			expect(height()).toBe(720);
		});
		cleanup();
	});

	test('reports the initial values before measuring', () => {
		const cleanup = $effect.root(() => {
			const { width, height } = useWindowSize({ initialWidth: 1024, initialHeight: 768 });
			// No flushSync: this is the SSR-equivalent state.
			expect(width()).toBe(1024);
			expect(height()).toBe(768);
		});
		cleanup();
	});

	test('defaults the initial values to 0', () => {
		const cleanup = $effect.root(() => {
			const { width, height } = useWindowSize();
			expect(width()).toBe(0);
			expect(height()).toBe(0);
		});
		cleanup();
	});

	test('updates on resize', () => {
		const cleanup = $effect.root(() => {
			resizeTo(800, 600);
			const { width, height } = useWindowSize();
			flushSync();

			resizeTo(1920, 1080);
			flushSync();

			expect(width()).toBe(1920);
			expect(height()).toBe(1080);
		});
		cleanup();
	});

	test('updates on orientationchange', () => {
		// Some mobile browsers fire only this on rotation.
		const cleanup = $effect.root(() => {
			resizeTo(390, 844);
			const { width, height } = useWindowSize();
			flushSync();

			resizeTo(844, 390, 'orientationchange');
			flushSync();

			expect(width()).toBe(844);
			expect(height()).toBe(390);
		});
		cleanup();
	});

	test('excludes the scrollbar when asked', () => {
		const cleanup = $effect.root(() => {
			resizeTo(1000, 800);
			const { width, height } = useWindowSize({ includeScrollbar: false });
			flushSync();

			// The fake clientWidth/Height are 15px smaller.
			expect(width()).toBe(985);
			expect(height()).toBe(785);
		});
		cleanup();
	});

	test('removes its listeners on scope destroy', () => {
		const removeSpy = vi.spyOn(window, 'removeEventListener');

		const cleanup = $effect.root(() => {
			useWindowSize();
			flushSync();
		});
		cleanup();

		const removed = removeSpy.mock.calls.map(([event]) => event);
		expect(removed).toContain('resize');
		expect(removed).toContain('orientationchange');
		removeSpy.mockRestore();
	});

	test('stops updating after the scope is destroyed', () => {
		let width!: () => number;
		const cleanup = $effect.root(() => {
			resizeTo(500, 500);
			({ width } = useWindowSize());
			flushSync();
		});

		cleanup();
		resizeTo(1600, 900);

		expect(width()).toBe(500);
	});
});

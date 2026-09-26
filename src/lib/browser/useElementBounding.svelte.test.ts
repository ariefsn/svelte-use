import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useElementBounding } from './useElementBounding.svelte.js';

/** Stubs getBoundingClientRect on an element so tests can position it. */
function place(el: Element, rect: { x: number; y: number; width: number; height: number }): void {
	const { x, y, width, height } = rect;
	vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
		x,
		y,
		top: y,
		left: x,
		right: x + width,
		bottom: y + height,
		width,
		height,
		toJSON: () => ({})
	} as DOMRect);
}

let observed: Element[] = [];
let originalRO: typeof ResizeObserver;

beforeEach(() => {
	observed = [];
	originalRO = globalThis.ResizeObserver;
	globalThis.ResizeObserver = class {
		constructor(private callback: ResizeObserverCallback) {}
		observe(el: Element) {
			observed.push(el);
		}
		unobserve() {}
		disconnect() {}
		/** Exposed so tests can simulate the element resizing. */
		trigger() {
			this.callback([], this as unknown as ResizeObserver);
		}
	} as unknown as typeof ResizeObserver;
});

afterEach(() => {
	globalThis.ResizeObserver = originalRO;
	vi.restoreAllMocks();
});

describe('useElementBounding', () => {
	test('reads the full rect', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);
		place(el, { x: 10, y: 20, width: 100, height: 50 });

		const cleanup = $effect.root(() => {
			const box = useElementBounding(() => el);
			flushSync();

			expect(box.x()).toBe(10);
			expect(box.y()).toBe(20);
			expect(box.left()).toBe(10);
			expect(box.top()).toBe(20);
			expect(box.right()).toBe(110);
			expect(box.bottom()).toBe(70);
			expect(box.width()).toBe(100);
			expect(box.height()).toBe(50);
		});

		cleanup();
		el.remove();
	});

	test('is all zeroes before the effect runs (SSR-equivalent state)', () => {
		const el = document.createElement('div');
		place(el, { x: 10, y: 20, width: 100, height: 50 });

		const cleanup = $effect.root(() => {
			const box = useElementBounding(() => el);
			expect(box.width()).toBe(0);
			expect(box.top()).toBe(0);
		});
		cleanup();
	});

	test('observes the element for size changes', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);
		place(el, { x: 0, y: 0, width: 10, height: 10 });

		const cleanup = $effect.root(() => {
			useElementBounding(() => el);
			flushSync();
		});

		expect(observed).toContain(el);
		cleanup();
		el.remove();
	});

	test('update() recalculates on demand', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);
		place(el, { x: 0, y: 0, width: 10, height: 10 });

		const cleanup = $effect.root(() => {
			const box = useElementBounding(() => el);
			flushSync();
			expect(box.width()).toBe(10);

			place(el, { x: 0, y: 0, width: 999, height: 10 });
			box.update();
			flushSync();

			expect(box.width()).toBe(999);
		});

		cleanup();
		el.remove();
	});

	test('recalculates on window scroll', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);
		place(el, { x: 0, y: 200, width: 10, height: 10 });

		const cleanup = $effect.root(() => {
			const box = useElementBounding(() => el);
			flushSync();
			expect(box.top()).toBe(200);

			// Scrolling moves the element relative to the viewport.
			place(el, { x: 0, y: 50, width: 10, height: 10 });
			window.dispatchEvent(new Event('scroll'));
			flushSync();

			expect(box.top()).toBe(50);
		});

		cleanup();
		el.remove();
	});

	test('recalculates on window resize', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);
		place(el, { x: 0, y: 0, width: 100, height: 10 });

		const cleanup = $effect.root(() => {
			const box = useElementBounding(() => el);
			flushSync();

			place(el, { x: 0, y: 0, width: 250, height: 10 });
			window.dispatchEvent(new Event('resize'));
			flushSync();

			expect(box.width()).toBe(250);
		});

		cleanup();
		el.remove();
	});

	test('resets to zero when the target becomes null', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);
		place(el, { x: 5, y: 5, width: 40, height: 40 });

		const cleanup = $effect.root(() => {
			let current = $state<Element | null>(el);
			const box = useElementBounding(() => current);
			flushSync();
			expect(box.width()).toBe(40);

			current = null;
			flushSync();

			expect(box.width()).toBe(0);
			expect(box.top()).toBe(0);
		});

		cleanup();
		el.remove();
	});

	test('keeps the last rect when reset is false', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);
		place(el, { x: 5, y: 5, width: 40, height: 40 });

		const cleanup = $effect.root(() => {
			let current = $state<Element | null>(el);
			const box = useElementBounding(() => current, { reset: false });
			flushSync();

			current = null;
			flushSync();

			expect(box.width()).toBe(40);
		});

		cleanup();
		el.remove();
	});

	test('does not attach listeners that are opted out', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);
		place(el, { x: 0, y: 0, width: 10, height: 10 });
		const addSpy = vi.spyOn(window, 'addEventListener');

		const cleanup = $effect.root(() => {
			useElementBounding(() => el, { windowResize: false, windowScroll: false });
			flushSync();
		});

		const added = addSpy.mock.calls.map(([event]) => event);
		expect(added).not.toContain('resize');
		expect(added).not.toContain('scroll');

		cleanup();
		el.remove();
	});

	test('does not notice the element moving without resizing', () => {
		// The documented reason update() exists. ResizeObserver watches only the
		// element's own size, and moving it fires no scroll or resize event, so
		// the tracked position goes stale until update() is called.
		const el = document.createElement('div');
		document.body.appendChild(el);
		place(el, { x: 0, y: 100, width: 50, height: 50 });

		const cleanup = $effect.root(() => {
			const box = useElementBounding(() => el);
			flushSync();
			expect(box.top()).toBe(100);

			// Same size, new position — as if a sibling above it appeared.
			place(el, { x: 0, y: 300, width: 50, height: 50 });
			flushSync();

			expect(box.top()).toBe(100);

			box.update();
			flushSync();

			expect(box.top()).toBe(300);
		});

		cleanup();
		el.remove();
	});

	test('stops updating after the scope is destroyed', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);
		place(el, { x: 0, y: 0, width: 10, height: 10 });

		let box!: ReturnType<typeof useElementBounding>;
		const cleanup = $effect.root(() => {
			box = useElementBounding(() => el);
			flushSync();
		});

		cleanup();
		place(el, { x: 0, y: 0, width: 777, height: 10 });
		window.dispatchEvent(new Event('scroll'));

		expect(box.width()).toBe(10);
		el.remove();
	});
});

import { flushSync } from 'svelte';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { useMouseInElement } from './useMouseInElement.svelte.js';

/** Creates an element positioned at a fixed viewport rect. */
function placedElement(x: number, y: number, width: number, height: number): HTMLDivElement {
	const el = document.createElement('div');
	document.body.appendChild(el);
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
	return el;
}

function moveMouse(clientX: number, clientY: number) {
	window.dispatchEvent(new MouseEvent('mousemove', { clientX, clientY }));
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe('useMouseInElement', () => {
	test('reports element-relative coordinates', () => {
		const el = placedElement(100, 50, 200, 100);

		const cleanup = $effect.root(() => {
			const m = useMouseInElement(() => el);
			flushSync();

			moveMouse(150, 80);
			flushSync();

			expect(m.x()).toBe(150);
			expect(m.y()).toBe(80);
			expect(m.elementX()).toBe(50);
			expect(m.elementY()).toBe(30);
			expect(m.isOutside()).toBe(false);
		});

		cleanup();
		el.remove();
	});

	test('exposes the element position and size', () => {
		const el = placedElement(10, 20, 300, 150);

		const cleanup = $effect.root(() => {
			const m = useMouseInElement(() => el);
			flushSync();

			moveMouse(50, 50);
			flushSync();

			expect(m.elementPositionX()).toBe(10);
			expect(m.elementPositionY()).toBe(20);
			expect(m.elementWidth()).toBe(300);
			expect(m.elementHeight()).toBe(150);
		});

		cleanup();
		el.remove();
	});

	test('starts outside before any pointer movement', () => {
		const el = placedElement(0, 0, 100, 100);

		const cleanup = $effect.root(() => {
			const m = useMouseInElement(() => el);
			flushSync();
			expect(m.isOutside()).toBe(true);
		});

		cleanup();
		el.remove();
	});

	test('detects the pointer leaving each edge', () => {
		const el = placedElement(100, 100, 100, 100);

		const cleanup = $effect.root(() => {
			const m = useMouseInElement(() => el);
			flushSync();

			moveMouse(150, 150); // inside
			flushSync();
			expect(m.isOutside()).toBe(false);

			moveMouse(50, 150); // left of it
			flushSync();
			expect(m.isOutside()).toBe(true);

			moveMouse(150, 50); // above it
			flushSync();
			expect(m.isOutside()).toBe(true);

			moveMouse(250, 150); // right of it
			flushSync();
			expect(m.isOutside()).toBe(true);

			moveMouse(150, 250); // below it
			flushSync();
			expect(m.isOutside()).toBe(true);
		});

		cleanup();
		el.remove();
	});

	test('reports negative offsets when the pointer is past the top-left', () => {
		const el = placedElement(100, 100, 50, 50);

		const cleanup = $effect.root(() => {
			const m = useMouseInElement(() => el);
			flushSync();

			moveMouse(80, 90);
			flushSync();

			// Deliberately not clamped — callers check isOutside().
			expect(m.elementX()).toBe(-20);
			expect(m.elementY()).toBe(-10);
		});

		cleanup();
		el.remove();
	});

	test('marks outside when the pointer leaves the document', () => {
		const el = placedElement(0, 0, 100, 100);

		const cleanup = $effect.root(() => {
			const m = useMouseInElement(() => el);
			flushSync();

			moveMouse(50, 50);
			flushSync();
			expect(m.isOutside()).toBe(false);

			document.dispatchEvent(new MouseEvent('mouseleave'));
			flushSync();

			expect(m.isOutside()).toBe(true);
		});

		cleanup();
		el.remove();
	});

	test('tracks touch movement', () => {
		const el = placedElement(0, 0, 200, 200);

		const cleanup = $effect.root(() => {
			const m = useMouseInElement(() => el);
			flushSync();

			// Chromium rejects a plain object here — it needs a real Touch.
			const touch = new Touch({ identifier: 0, target: el, clientX: 30, clientY: 40 });
			window.dispatchEvent(new TouchEvent('touchmove', { touches: [touch] }));
			flushSync();

			expect(m.elementX()).toBe(30);
			expect(m.elementY()).toBe(40);
		});

		cleanup();
		el.remove();
	});

	test('skips touch listeners when disabled', () => {
		const el = placedElement(0, 0, 200, 200);
		const addSpy = vi.spyOn(window, 'addEventListener');

		const cleanup = $effect.root(() => {
			useMouseInElement(() => el, { touch: false });
			flushSync();
		});

		expect(addSpy.mock.calls.map(([e]) => e)).not.toContain('touchmove');

		cleanup();
		el.remove();
	});

	test('does nothing without a target', () => {
		const cleanup = $effect.root(() => {
			const m = useMouseInElement(() => null);
			flushSync();

			moveMouse(50, 50);
			flushSync();

			expect(m.x()).toBe(0);
			expect(m.isOutside()).toBe(true);
		});
		cleanup();
	});

	test('stops updating after the scope is destroyed', () => {
		const el = placedElement(0, 0, 100, 100);

		let m!: ReturnType<typeof useMouseInElement>;
		const cleanup = $effect.root(() => {
			m = useMouseInElement(() => el);
			flushSync();
			moveMouse(10, 10);
			flushSync();
		});

		cleanup();
		moveMouse(90, 90);

		expect(m.elementX()).toBe(10);
		el.remove();
	});
});

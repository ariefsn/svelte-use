import { flushSync } from 'svelte';
import { describe, expect, test } from 'vitest';
import { useDraggable } from './useDraggable.svelte.js';

function pointerDown(el: HTMLElement, x: number, y: number) {
	el.dispatchEvent(
		new PointerEvent('pointerdown', { clientX: x, clientY: y, bubbles: true, pointerId: 1 })
	);
}

function pointerMove(el: HTMLElement, x: number, y: number) {
	el.dispatchEvent(
		new PointerEvent('pointermove', { clientX: x, clientY: y, bubbles: true, pointerId: 1 })
	);
}

function pointerUp(el: HTMLElement) {
	el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }));
}

describe('useDraggable', () => {
	test('starts at (0, 0) by default', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		const cleanup = $effect.root(() => {
			const drag = useDraggable(() => el);
			expect(drag.x).toBe(0);
			expect(drag.y).toBe(0);
			expect(drag.isDragging).toBe(false);
		});

		el.remove();
		cleanup();
	});

	test('respects initialX and initialY options', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		const cleanup = $effect.root(() => {
			const drag = useDraggable(() => el, { initialX: 100, initialY: 200 });
			expect(drag.x).toBe(100);
			expect(drag.y).toBe(200);
		});

		el.remove();
		cleanup();
	});

	test('isDragging is true during drag', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		let drag!: ReturnType<typeof useDraggable>;

		const cleanup = $effect.root(() => {
			drag = useDraggable(() => el);
		});

		flushSync();

		pointerDown(el, 0, 0);
		expect(drag.isDragging).toBe(true);

		pointerUp(el);
		expect(drag.isDragging).toBe(false);

		el.remove();
		cleanup();
	});

	test('updates x and y on pointermove', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		let drag!: ReturnType<typeof useDraggable>;

		const cleanup = $effect.root(() => {
			drag = useDraggable(() => el);
		});

		flushSync();

		pointerDown(el, 50, 80);
		pointerMove(el, 100, 130);

		expect(drag.x).toBe(50); // moved 50px right
		expect(drag.y).toBe(50); // moved 50px down

		el.remove();
		cleanup();
	});

	test('position is relative to drag start offset', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		let drag!: ReturnType<typeof useDraggable>;

		const cleanup = $effect.root(() => {
			drag = useDraggable(() => el, { initialX: 20, initialY: 40 });
		});

		flushSync();

		pointerDown(el, 100, 100);
		pointerMove(el, 110, 120);

		expect(drag.x).toBe(30); // 20 + (110-100)
		expect(drag.y).toBe(60); // 40 + (120-100)

		el.remove();
		cleanup();
	});

	test('pointermove does nothing when not dragging', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		let drag!: ReturnType<typeof useDraggable>;

		const cleanup = $effect.root(() => {
			drag = useDraggable(() => el);
		});

		flushSync();

		// No pointerdown — move should not change position
		pointerMove(el, 200, 300);
		expect(drag.x).toBe(0);
		expect(drag.y).toBe(0);

		el.remove();
		cleanup();
	});

	test('position stops updating after pointerup', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		let drag!: ReturnType<typeof useDraggable>;

		const cleanup = $effect.root(() => {
			drag = useDraggable(() => el);
		});

		flushSync();

		pointerDown(el, 0, 0);
		pointerMove(el, 50, 50);
		pointerUp(el);
		pointerMove(el, 200, 200);

		// Position should remain at where it stopped
		expect(drag.x).toBe(50);
		expect(drag.y).toBe(50);
		expect(drag.isDragging).toBe(false);

		el.remove();
		cleanup();
	});

	test('returns initial values when target is null', () => {
		const cleanup = $effect.root(() => {
			const drag = useDraggable(() => null, { initialX: 10, initialY: 20 });
			flushSync();
			expect(drag.x).toBe(10);
			expect(drag.y).toBe(20);
			expect(drag.isDragging).toBe(false);
		});

		cleanup();
	});

	test('removes listeners on cleanup — isDragging resets to false', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		let drag!: ReturnType<typeof useDraggable>;

		const cleanup = $effect.root(() => {
			drag = useDraggable(() => el);
		});

		flushSync();

		pointerDown(el, 0, 0);
		expect(drag.isDragging).toBe(true);

		cleanup();

		expect(drag.isDragging).toBe(false);

		// Events after cleanup should have no effect
		pointerMove(el, 100, 100);
		expect(drag.x).toBe(0);
		expect(drag.y).toBe(0);

		el.remove();
	});
});

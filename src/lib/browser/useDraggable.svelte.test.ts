import { flushSync } from 'svelte';
import { describe, expect, test, vi } from 'vitest';
import { useDraggable } from './useDraggable.svelte.js';
import type { UseDraggableOptions } from './useDraggable.svelte.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Creates a bare `HTMLElement` with a minimal `setPointerCapture` stub
 * (jsdom does not implement it).
 */
function makeEl(): HTMLElement {
	const el = document.createElement('div');
	el.setPointerCapture = vi.fn();
	el.releasePointerCapture = vi.fn();
	document.body.appendChild(el);
	return el;
}

function firePointerDown(
	target: HTMLElement,
	x: number,
	y: number,
	extras: PointerEventInit = {}
): void {
	target.dispatchEvent(
		new PointerEvent('pointerdown', {
			clientX: x,
			clientY: y,
			button: 0,
			pointerType: 'mouse',
			bubbles: true,
			...extras
		})
	);
}

function firePointerMove(
	target: HTMLElement,
	x: number,
	y: number,
	extras: PointerEventInit = {}
): void {
	target.dispatchEvent(
		new PointerEvent('pointermove', {
			clientX: x,
			clientY: y,
			pointerType: 'mouse',
			bubbles: true,
			...extras
		})
	);
}

function firePointerUp(
	target: HTMLElement,
	x: number,
	y: number,
	extras: PointerEventInit = {}
): void {
	target.dispatchEvent(
		new PointerEvent('pointerup', {
			clientX: x,
			clientY: y,
			pointerType: 'mouse',
			bubbles: true,
			...extras
		})
	);
}

function firePointerCancel(target: HTMLElement): void {
	target.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true }));
}

function setupDraggable(opts: UseDraggableOptions = {}) {
	const el = makeEl();
	let drag!: ReturnType<typeof useDraggable>;

	const cleanup = $effect.root(() => {
		drag = useDraggable(el, opts);
	});

	flushSync();

	return { el, drag, cleanup };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useDraggable', () => {
	describe('initial state', () => {
		test('x and y default to 0', () => {
			const { drag, cleanup, el } = setupDraggable();
			expect(drag.x()).toBe(0);
			expect(drag.y()).toBe(0);
			cleanup();
			el.remove();
		});

		test('respects initialValue', () => {
			const { drag, cleanup, el } = setupDraggable({ initialValue: { x: 50, y: 100 } });
			expect(drag.x()).toBe(50);
			expect(drag.y()).toBe(100);
			cleanup();
			el.remove();
		});

		test('isDragging starts false', () => {
			const { drag, cleanup, el } = setupDraggable();
			expect(drag.isDragging()).toBe(false);
			cleanup();
			el.remove();
		});

		test('style reflects initial position', () => {
			const { drag, cleanup, el } = setupDraggable({ initialValue: { x: 10, y: 20 } });
			expect(drag.style()).toBe('transform: translate(10px, 20px);');
			cleanup();
			el.remove();
		});
	});

	describe('basic drag flow', () => {
		test('isDragging becomes true on pointerdown', () => {
			const { el, drag, cleanup } = setupDraggable();

			firePointerDown(el, 0, 0);
			expect(drag.isDragging()).toBe(true);

			cleanup();
			el.remove();
		});

		test('position updates on pointermove after pointerdown', () => {
			const { el, drag, cleanup } = setupDraggable();

			firePointerDown(el, 0, 0);
			firePointerMove(el, 50, 80);

			expect(drag.x()).toBe(50);
			expect(drag.y()).toBe(80);

			cleanup();
			el.remove();
		});

		test('isDragging becomes false on pointerup', () => {
			const { el, drag, cleanup } = setupDraggable();

			firePointerDown(el, 0, 0);
			firePointerMove(el, 30, 40);
			firePointerUp(el, 30, 40);

			expect(drag.isDragging()).toBe(false);

			cleanup();
			el.remove();
		});

		test('isDragging becomes false on pointercancel', () => {
			const { el, drag, cleanup } = setupDraggable();

			firePointerDown(el, 0, 0);
			firePointerCancel(el);

			expect(drag.isDragging()).toBe(false);

			cleanup();
			el.remove();
		});

		test('style updates after drag', () => {
			const { el, drag, cleanup } = setupDraggable();

			firePointerDown(el, 0, 0);
			firePointerMove(el, 120, 60);

			expect(drag.style()).toBe('transform: translate(120px, 60px);');

			cleanup();
			el.remove();
		});

		test('delta mode: position is offset from grab point', () => {
			const { el, drag, cleanup } = setupDraggable({ initialValue: { x: 100, y: 100 } });

			// Grab at (110, 115) — offsets are (110-100)=10 and (115-100)=15
			firePointerDown(el, 110, 115);
			// Move pointer to (200, 200) → new position = (200-10, 200-15) = (190, 185)
			firePointerMove(el, 200, 200);

			expect(drag.x()).toBe(190);
			expect(drag.y()).toBe(185);

			cleanup();
			el.remove();
		});

		test('pointermove without prior pointerdown is ignored', () => {
			const { el, drag, cleanup } = setupDraggable();

			firePointerMove(el, 100, 200);

			expect(drag.x()).toBe(0);
			expect(drag.y()).toBe(0);
			expect(drag.isDragging()).toBe(false);

			cleanup();
			el.remove();
		});
	});

	describe('exact mode', () => {
		test('position matches pointer coordinates directly', () => {
			const { el, drag, cleanup } = setupDraggable({ exact: true });

			firePointerDown(el, 50, 60);
			firePointerMove(el, 200, 300);

			expect(drag.x()).toBe(200);
			expect(drag.y()).toBe(300);

			cleanup();
			el.remove();
		});
	});

	describe('axis constraint', () => {
		test('axis x: only x updates', () => {
			const { el, drag, cleanup } = setupDraggable({ axis: 'x' });

			firePointerDown(el, 0, 0);
			firePointerMove(el, 50, 80);

			expect(drag.x()).toBe(50);
			expect(drag.y()).toBe(0);

			cleanup();
			el.remove();
		});

		test('axis y: only y updates', () => {
			const { el, drag, cleanup } = setupDraggable({ axis: 'y' });

			firePointerDown(el, 0, 0);
			firePointerMove(el, 50, 80);

			expect(drag.x()).toBe(0);
			expect(drag.y()).toBe(80);

			cleanup();
			el.remove();
		});

		test('axis both: both axes update', () => {
			const { el, drag, cleanup } = setupDraggable({ axis: 'both' });

			firePointerDown(el, 0, 0);
			firePointerMove(el, 50, 80);

			expect(drag.x()).toBe(50);
			expect(drag.y()).toBe(80);

			cleanup();
			el.remove();
		});
	});

	describe('disabled flag', () => {
		test('drag does not start when disabled', () => {
			const { el, drag, cleanup } = setupDraggable({ disabled: true });

			firePointerDown(el, 0, 0);
			firePointerMove(el, 100, 100);

			expect(drag.isDragging()).toBe(false);
			expect(drag.x()).toBe(0);
			expect(drag.y()).toBe(0);

			cleanup();
			el.remove();
		});
	});

	describe('button filter', () => {
		test('drag does not start on wrong button', () => {
			const { el, drag, cleanup } = setupDraggable({ button: 0 });

			firePointerDown(el, 0, 0, { button: 2 }); // right-click
			firePointerMove(el, 100, 100);

			expect(drag.isDragging()).toBe(false);

			cleanup();
			el.remove();
		});

		test('drag starts on correct button', () => {
			const { el, drag, cleanup } = setupDraggable({ button: 0 });

			firePointerDown(el, 0, 0, { button: 0 });

			expect(drag.isDragging()).toBe(true);

			cleanup();
			el.remove();
		});
	});

	describe('pointerTypes filter', () => {
		test('drag does not start for filtered-out pointer type', () => {
			const { el, drag, cleanup } = setupDraggable({ pointerTypes: ['mouse'] });

			firePointerDown(el, 0, 0, { pointerType: 'touch' });
			firePointerMove(el, 50, 50, { pointerType: 'touch' });

			expect(drag.isDragging()).toBe(false);

			cleanup();
			el.remove();
		});

		test('drag starts for allowed pointer type', () => {
			const { el, drag, cleanup } = setupDraggable({ pointerTypes: ['mouse', 'touch'] });

			firePointerDown(el, 0, 0, { pointerType: 'touch' });

			expect(drag.isDragging()).toBe(true);

			cleanup();
			el.remove();
		});
	});

	describe('container bounds clamping', () => {
		test('position is clamped to static bounds', () => {
			const { el, drag, cleanup } = setupDraggable({
				exact: true,
				containerBounds: { minX: 0, maxX: 100, minY: 0, maxY: 100 }
			});

			firePointerDown(el, 0, 0);
			firePointerMove(el, 200, 200);

			expect(drag.x()).toBe(100);
			expect(drag.y()).toBe(100);

			cleanup();
			el.remove();
		});

		test('position is clamped at minimum bounds', () => {
			const { el, drag, cleanup } = setupDraggable({
				exact: true,
				containerBounds: { minX: 10, maxX: 200, minY: 10, maxY: 200 }
			});

			firePointerDown(el, 10, 10);
			firePointerMove(el, 5, 5);

			expect(drag.x()).toBe(10);
			expect(drag.y()).toBe(10);

			cleanup();
			el.remove();
		});
	});

	describe('handle element', () => {
		test('drag initiates from handle, not target', () => {
			const el = makeEl();
			const handle = makeEl();
			handle.setPointerCapture = vi.fn();

			let drag!: ReturnType<typeof useDraggable>;

			const cleanup = $effect.root(() => {
				drag = useDraggable(el, { handle });
			});

			flushSync();

			// pointerdown on handle should start dragging
			firePointerDown(handle, 0, 0);
			expect(drag.isDragging()).toBe(true);

			firePointerMove(el, 50, 60);
			expect(drag.x()).toBe(50);
			expect(drag.y()).toBe(60);

			cleanup();
			el.remove();
			handle.remove();
		});

		test('pointerdown on target (not handle) does not start drag', () => {
			const el = makeEl();
			const handle = makeEl();

			let drag!: ReturnType<typeof useDraggable>;

			const cleanup = $effect.root(() => {
				drag = useDraggable(el, { handle });
			});

			flushSync();

			// pointerdown on target directly — handle is separate, so this should not trigger
			firePointerDown(el, 0, 0);
			expect(drag.isDragging()).toBe(false);

			cleanup();
			el.remove();
			handle.remove();
		});
	});

	describe('lifecycle callbacks', () => {
		test('onStart is called with initial position', () => {
			const onStart = vi.fn();
			const { el, cleanup } = setupDraggable({ onStart });

			firePointerDown(el, 10, 20);

			expect(onStart).toHaveBeenCalledOnce();
			expect(onStart).toHaveBeenCalledWith({ x: 0, y: 0 }, expect.any(PointerEvent));

			cleanup();
			el.remove();
		});

		test('onMove is called during drag', () => {
			const onMove = vi.fn();
			const { el, cleanup } = setupDraggable({ onMove });

			firePointerDown(el, 0, 0);
			firePointerMove(el, 30, 40);

			expect(onMove).toHaveBeenCalledWith({ x: 30, y: 40 }, expect.any(PointerEvent));

			cleanup();
			el.remove();
		});

		test('onEnd is called on pointerup', () => {
			const onEnd = vi.fn();
			const { el, cleanup } = setupDraggable({ onEnd });

			firePointerDown(el, 0, 0);
			firePointerMove(el, 50, 60);
			firePointerUp(el, 50, 60);

			expect(onEnd).toHaveBeenCalledOnce();
			expect(onEnd).toHaveBeenCalledWith({ x: 50, y: 60 }, expect.any(PointerEvent));

			cleanup();
			el.remove();
		});

		test('returning false from onStart cancels drag', () => {
			const onStart = vi.fn(() => false as const);
			const { el, drag, cleanup } = setupDraggable({ onStart });

			firePointerDown(el, 0, 0);
			firePointerMove(el, 100, 100);

			expect(drag.isDragging()).toBe(false);
			expect(drag.x()).toBe(0);

			cleanup();
			el.remove();
		});
	});

	describe('preventDefault / stopPropagation', () => {
		test('preventDefault is called when option is true', () => {
			const { el, cleanup } = setupDraggable({ preventDefault: true });

			const event = new PointerEvent('pointerdown', {
				clientX: 0,
				clientY: 0,
				button: 0,
				pointerType: 'mouse',
				bubbles: true,
				cancelable: true
			});
			const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

			el.dispatchEvent(event);

			expect(preventDefaultSpy).toHaveBeenCalled();

			cleanup();
			el.remove();
		});

		test('stopPropagation is called when option is true', () => {
			const { el, cleanup } = setupDraggable({ stopPropagation: true });

			const event = new PointerEvent('pointerdown', {
				clientX: 0,
				clientY: 0,
				button: 0,
				pointerType: 'mouse',
				bubbles: true
			});
			const stopSpy = vi.spyOn(event, 'stopPropagation');

			el.dispatchEvent(event);

			expect(stopSpy).toHaveBeenCalled();

			cleanup();
			el.remove();
		});
	});

	describe('cleanup', () => {
		test('stops responding after cleanup', () => {
			const { el, drag, cleanup } = setupDraggable();

			firePointerDown(el, 0, 0);
			cleanup();

			// After cleanup isDragging is reset to false.
			expect(drag.isDragging()).toBe(false);

			// New events are no longer processed.
			firePointerMove(el, 200, 200);
			expect(drag.x()).toBe(0);
			expect(drag.y()).toBe(0);

			el.remove();
		});
	});
});

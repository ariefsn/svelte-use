import { flushSync } from 'svelte';
import { describe, expect, test, beforeEach, afterEach } from 'vitest';
import { useMouse } from './useMouse.svelte.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fireMouseMove(x: number, y: number): void {
	window.dispatchEvent(new MouseEvent('mousemove', { clientX: x, clientY: y, bubbles: true }));
}

function fireTouchMove(x: number, y: number): void {
	const touch = new Touch({ identifier: 1, target: document.body, clientX: x, clientY: y });
	window.dispatchEvent(new TouchEvent('touchmove', { touches: [touch], bubbles: true }));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useMouse', () => {
	describe('initial state', () => {
		test('x and y start at 0', () => {
			const cleanup = $effect.root(() => {
				const mouse = useMouse();
				flushSync();
				expect(mouse.x()).toBe(0);
				expect(mouse.y()).toBe(0);
			});
			cleanup();
		});

		test('sourceType starts as null', () => {
			const cleanup = $effect.root(() => {
				const mouse = useMouse();
				flushSync();
				expect(mouse.sourceType()).toBeNull();
			});
			cleanup();
		});
	});

	describe('mousemove tracking', () => {
		test('updates x and y on mousemove', () => {
			let mouse!: ReturnType<typeof useMouse>;

			const cleanup = $effect.root(() => {
				mouse = useMouse();
			});

			flushSync();
			fireMouseMove(150, 250);

			expect(mouse.x()).toBe(150);
			expect(mouse.y()).toBe(250);

			cleanup();
		});

		test('sets sourceType to "mouse" on mousemove', () => {
			let mouse!: ReturnType<typeof useMouse>;

			const cleanup = $effect.root(() => {
				mouse = useMouse();
			});

			flushSync();
			fireMouseMove(10, 20);

			expect(mouse.sourceType()).toBe('mouse');

			cleanup();
		});

		test('updates on consecutive mousemove events', () => {
			let mouse!: ReturnType<typeof useMouse>;

			const cleanup = $effect.root(() => {
				mouse = useMouse();
			});

			flushSync();
			fireMouseMove(10, 20);
			expect(mouse.x()).toBe(10);
			expect(mouse.y()).toBe(20);

			fireMouseMove(300, 400);
			expect(mouse.x()).toBe(300);
			expect(mouse.y()).toBe(400);

			cleanup();
		});
	});

	describe('touchmove tracking (enabled by default)', () => {
		test('updates x and y on touchmove', () => {
			let mouse!: ReturnType<typeof useMouse>;

			const cleanup = $effect.root(() => {
				mouse = useMouse();
			});

			flushSync();
			fireTouchMove(99, 88);

			expect(mouse.x()).toBe(99);
			expect(mouse.y()).toBe(88);

			cleanup();
		});

		test('sets sourceType to "touch" on touchmove', () => {
			let mouse!: ReturnType<typeof useMouse>;

			const cleanup = $effect.root(() => {
				mouse = useMouse();
			});

			flushSync();
			fireTouchMove(10, 10);

			expect(mouse.sourceType()).toBe('touch');

			cleanup();
		});

		test('sourceType switches from "touch" to "mouse" on subsequent mousemove', () => {
			let mouse!: ReturnType<typeof useMouse>;

			const cleanup = $effect.root(() => {
				mouse = useMouse();
			});

			flushSync();
			fireTouchMove(5, 5);
			expect(mouse.sourceType()).toBe('touch');

			fireMouseMove(50, 50);
			expect(mouse.sourceType()).toBe('mouse');

			cleanup();
		});
	});

	describe('touch disabled', () => {
		test('does not update on touchmove when touch is false', () => {
			let mouse!: ReturnType<typeof useMouse>;

			const cleanup = $effect.root(() => {
				mouse = useMouse({ touch: false });
			});

			flushSync();
			fireTouchMove(200, 300);

			expect(mouse.x()).toBe(0);
			expect(mouse.y()).toBe(0);
			expect(mouse.sourceType()).toBeNull();

			cleanup();
		});

		test('still updates on mousemove when touch is false', () => {
			let mouse!: ReturnType<typeof useMouse>;

			const cleanup = $effect.root(() => {
				mouse = useMouse({ touch: false });
			});

			flushSync();
			fireMouseMove(77, 88);

			expect(mouse.x()).toBe(77);
			expect(mouse.y()).toBe(88);
			expect(mouse.sourceType()).toBe('mouse');

			cleanup();
		});
	});

	describe('cleanup', () => {
		test('stops updating after cleanup', () => {
			let mouse!: ReturnType<typeof useMouse>;

			const cleanup = $effect.root(() => {
				mouse = useMouse();
			});

			flushSync();
			fireMouseMove(10, 20);
			expect(mouse.x()).toBe(10);

			cleanup();

			fireMouseMove(999, 999);
			// Position should remain unchanged after cleanup.
			expect(mouse.x()).toBe(10);
			expect(mouse.y()).toBe(20);
		});

		test('touch listener stops updating after cleanup', () => {
			let mouse!: ReturnType<typeof useMouse>;

			const cleanup = $effect.root(() => {
				mouse = useMouse();
			});

			flushSync();
			fireTouchMove(5, 5);
			expect(mouse.x()).toBe(5);

			cleanup();

			fireTouchMove(999, 999);
			expect(mouse.x()).toBe(5);
		});
	});
});

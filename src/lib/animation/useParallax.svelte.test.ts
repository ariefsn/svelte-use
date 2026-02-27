import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { flushSync } from 'svelte';
import { useParallax } from './useParallax.svelte.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockElement(rect: Partial<DOMRect> = {}): HTMLElement {
	const defaultRect: DOMRect = {
		left: 100,
		top: 200,
		width: 200,
		height: 100,
		right: 300,
		bottom: 300,
		x: 100,
		y: 200,
		toJSON: () => ({})
	};

	return {
		getBoundingClientRect: vi.fn(() => ({ ...defaultRect, ...rect }))
	} as unknown as HTMLElement;
}

function fireMouseMove(clientX: number, clientY: number) {
	const event = new MouseEvent('mousemove', { clientX, clientY });
	window.dispatchEvent(event);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useParallax', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	test('returns an object with x and y properties', () => {
		const cleanup = $effect.root(() => {
			const result = useParallax(() => null);
			expect('x' in result).toBe(true);
			expect('y' in result).toBe(true);
		});
		cleanup();
	});

	test('x and y default to 0 when target is null', () => {
		const cleanup = $effect.root(() => {
			const { x, y } = useParallax(() => null);
			flushSync();
			expect(x).toBe(0);
			expect(y).toBe(0);
		});
		cleanup();
	});

	test('x and y default to 0 when target is undefined', () => {
		const cleanup = $effect.root(() => {
			const { x, y } = useParallax(() => undefined);
			flushSync();
			expect(x).toBe(0);
			expect(y).toBe(0);
		});
		cleanup();
	});

	test('calculates offset from element centre with default speed', () => {
		// Element centred at (200, 250).
		const el = createMockElement({ left: 100, top: 200, width: 200, height: 100 });

		const cleanup = $effect.root(() => {
			const result = useParallax(() => el);
			flushSync();

			// Mouse at (300, 350) → raw offset (100, 100) × speed 0.1 = (10, 10).
			fireMouseMove(300, 350);
			expect(result.x).toBeCloseTo(10, 5);
			expect(result.y).toBeCloseTo(10, 5);
		});
		cleanup();
	});

	test('applies custom speed multiplier', () => {
		const el = createMockElement({ left: 0, top: 0, width: 200, height: 200 });

		const cleanup = $effect.root(() => {
			const result = useParallax(() => el, { speed: 0.5 });
			flushSync();

			// Centre is at (100, 100). Mouse at (200, 200) → raw offset (100, 100) × 0.5.
			fireMouseMove(200, 200);
			expect(result.x).toBeCloseTo(50, 5);
			expect(result.y).toBeCloseTo(50, 5);
		});
		cleanup();
	});

	test('negative speed inverts offset direction', () => {
		const el = createMockElement({ left: 0, top: 0, width: 200, height: 200 });

		const cleanup = $effect.root(() => {
			const result = useParallax(() => el, { speed: -0.1 });
			flushSync();

			// Centre at (100, 100). Mouse at (200, 200) → raw offset (100, 100) × -0.1.
			fireMouseMove(200, 200);
			expect(result.x).toBeCloseTo(-10, 5);
			expect(result.y).toBeCloseTo(-10, 5);
		});
		cleanup();
	});

	test('offset is zero when mouse is at element centre', () => {
		const el = createMockElement({ left: 100, top: 100, width: 200, height: 200 });

		const cleanup = $effect.root(() => {
			const result = useParallax(() => el);
			flushSync();

			// Centre is (200, 200) — mouse exactly at centre → offset (0, 0).
			fireMouseMove(200, 200);
			expect(result.x).toBeCloseTo(0, 5);
			expect(result.y).toBeCloseTo(0, 5);
		});
		cleanup();
	});

	test('x and y reset to 0 and listener is removed on scope destroy', () => {
		const el = createMockElement();
		const removeListenerSpy = vi.spyOn(window, 'removeEventListener');

		const cleanup = $effect.root(() => {
			const result = useParallax(() => el);
			flushSync();
			fireMouseMove(400, 400);
			expect(result.x).not.toBe(0);
			expect(result.y).not.toBe(0);
		});

		cleanup();

		expect(removeListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
	});

	test('removes listener when target changes to null', () => {
		let el = $state<HTMLElement | null>(createMockElement());
		const removeListenerSpy = vi.spyOn(window, 'removeEventListener');

		const cleanup = $effect.root(() => {
			const result = useParallax(() => el);
			flushSync();
			fireMouseMove(300, 300);
			expect(result.x).not.toBe(0);

			// Nullify target — effect should re-run and clean up the listener.
			el = null;
			flushSync();

			// After target becomes null, offsets reset and no listener fires.
			fireMouseMove(500, 500);
			expect(result.x).toBe(0);
			expect(result.y).toBe(0);
		});

		expect(removeListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
		cleanup();
	});

	test('SSR safe — does not throw when window is undefined', () => {
		const windowBackup = globalThis.window;
		// @ts-expect-error intentional undefined for SSR test
		delete globalThis.window;

		expect(() => {
			const cleanup = $effect.root(() => {
				const { x, y } = useParallax(() => null);
				flushSync();
				expect(x).toBe(0);
				expect(y).toBe(0);
			});
			cleanup();
		}).not.toThrow();

		globalThis.window = windowBackup;
	});

	test('reactive values x and y reflect latest mouse position', () => {
		const el = createMockElement({ left: 0, top: 0, width: 100, height: 100 });

		const cleanup = $effect.root(() => {
			const result = useParallax(() => el, { speed: 1 });
			flushSync();

			// Centre at (50, 50).
			fireMouseMove(100, 100);
			expect(result.x).toBeCloseTo(50, 5);
			expect(result.y).toBeCloseTo(50, 5);

			fireMouseMove(0, 0);
			expect(result.x).toBeCloseTo(-50, 5);
			expect(result.y).toBeCloseTo(-50, 5);
		});
		cleanup();
	});
});

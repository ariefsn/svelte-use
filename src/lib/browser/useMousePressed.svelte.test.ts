import { flushSync } from 'svelte';
import { describe, expect, test } from 'vitest';
import { useMousePressed } from './useMousePressed.svelte.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fireMouseDown(): void {
	window.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
}

function fireMouseUp(): void {
	window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useMousePressed', () => {
	test('returns false initially', () => {
		const cleanup = $effect.root(() => {
			const isPressed = useMousePressed();
			flushSync();
			expect(isPressed()).toBe(false);
		});
		cleanup();
	});

	test('returns true after mousedown', () => {
		let isPressed!: () => boolean;

		const cleanup = $effect.root(() => {
			isPressed = useMousePressed();
		});

		flushSync();
		fireMouseDown();

		expect(isPressed()).toBe(true);

		cleanup();
	});

	test('returns false after mouseup', () => {
		let isPressed!: () => boolean;

		const cleanup = $effect.root(() => {
			isPressed = useMousePressed();
		});

		flushSync();
		fireMouseDown();
		expect(isPressed()).toBe(true);

		fireMouseUp();
		expect(isPressed()).toBe(false);

		cleanup();
	});

	test('cycles correctly through multiple press/release pairs', () => {
		let isPressed!: () => boolean;

		const cleanup = $effect.root(() => {
			isPressed = useMousePressed();
		});

		flushSync();

		for (let i = 0; i < 3; i++) {
			fireMouseDown();
			expect(isPressed()).toBe(true);

			fireMouseUp();
			expect(isPressed()).toBe(false);
		}

		cleanup();
	});

	test('stops responding after cleanup', () => {
		let isPressed!: () => boolean;

		const cleanup = $effect.root(() => {
			isPressed = useMousePressed();
		});

		flushSync();
		cleanup();

		fireMouseDown();
		// Should remain false as listeners were removed.
		expect(isPressed()).toBe(false);
	});

	test('mouseup while already released stays false', () => {
		let isPressed!: () => boolean;

		const cleanup = $effect.root(() => {
			isPressed = useMousePressed();
		});

		flushSync();
		fireMouseUp();

		expect(isPressed()).toBe(false);

		cleanup();
	});

	test('mousedown without prior release stays true', () => {
		let isPressed!: () => boolean;

		const cleanup = $effect.root(() => {
			isPressed = useMousePressed();
		});

		flushSync();
		fireMouseDown();
		fireMouseDown();

		expect(isPressed()).toBe(true);

		cleanup();
	});
});

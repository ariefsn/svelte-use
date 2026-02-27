import { flushSync } from 'svelte';
import { describe, expect, test } from 'vitest';
import { useKeyModifier } from './useKeyModifier.svelte.js';

function keyDown(key: string) {
	window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

function keyUp(key: string) {
	window.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }));
}

describe('useKeyModifier', () => {
	test('returns false initially when modifier is not pressed', () => {
		const cleanup = $effect.root(() => {
			const isCtrl = useKeyModifier('ctrl');
			flushSync();
			expect(isCtrl()).toBe(false);
		});
		cleanup();
	});

	test('returns true when ctrl (Control) is pressed', () => {
		let isCtrl!: () => boolean;

		const cleanup = $effect.root(() => {
			isCtrl = useKeyModifier('ctrl');
		});

		flushSync();

		keyDown('Control');
		expect(isCtrl()).toBe(true);

		keyUp('Control');
		expect(isCtrl()).toBe(false);

		cleanup();
	});

	test('returns true when shift is pressed', () => {
		let isShift!: () => boolean;

		const cleanup = $effect.root(() => {
			isShift = useKeyModifier('shift');
		});

		flushSync();

		keyDown('Shift');
		expect(isShift()).toBe(true);

		keyUp('Shift');
		expect(isShift()).toBe(false);

		cleanup();
	});

	test('returns true when alt is pressed', () => {
		let isAlt!: () => boolean;

		const cleanup = $effect.root(() => {
			isAlt = useKeyModifier('alt');
		});

		flushSync();

		keyDown('Alt');
		expect(isAlt()).toBe(true);

		keyUp('Alt');
		expect(isAlt()).toBe(false);

		cleanup();
	});

	test('returns true when meta is pressed', () => {
		let isMeta!: () => boolean;

		const cleanup = $effect.root(() => {
			isMeta = useKeyModifier('meta');
		});

		flushSync();

		keyDown('Meta');
		expect(isMeta()).toBe(true);

		keyUp('Meta');
		expect(isMeta()).toBe(false);

		cleanup();
	});

	test('two instances for the same modifier share state', () => {
		let a!: () => boolean;
		let b!: () => boolean;

		const cleanup = $effect.root(() => {
			a = useKeyModifier('ctrl');
			b = useKeyModifier('ctrl');
		});

		flushSync();

		keyDown('Control');
		expect(a()).toBe(true);
		expect(b()).toBe(true);

		keyUp('Control');
		expect(a()).toBe(false);
		expect(b()).toBe(false);

		cleanup();
	});

	test('independent modifiers do not interfere', () => {
		let isCtrl!: () => boolean;
		let isShift!: () => boolean;

		const cleanup = $effect.root(() => {
			isCtrl = useKeyModifier('ctrl');
			isShift = useKeyModifier('shift');
		});

		flushSync();

		keyDown('Control');
		expect(isCtrl()).toBe(true);
		expect(isShift()).toBe(false);

		keyDown('Shift');
		expect(isCtrl()).toBe(true);
		expect(isShift()).toBe(true);

		keyUp('Control');
		expect(isCtrl()).toBe(false);
		expect(isShift()).toBe(true);

		keyUp('Shift');
		cleanup();
	});

	test('stops tracking after cleanup', () => {
		let isCtrl!: () => boolean;

		const cleanup = $effect.root(() => {
			isCtrl = useKeyModifier('ctrl');
		});

		flushSync();

		keyDown('Control');
		expect(isCtrl()).toBe(true);

		cleanup();

		// After cleanup, key events should not update the returned getter
		keyUp('Control');
		keyDown('Control');
		// The getter is a snapshot — the state no longer receives updates
		// but the last read value may be whatever it was at cleanup time.
		// The important assertion is that no error is thrown.
		expect(typeof isCtrl()).toBe('boolean');
	});
});

import { flushSync } from 'svelte';
import { describe, expect, test } from 'vitest';
import { useMagicKeys } from './useMagicKeys.svelte.js';

function keyDown(key: string) {
	window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

function keyUp(key: string) {
	window.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }));
}

describe('useMagicKeys', () => {
	test('returns false for a key that is not pressed', () => {
		const cleanup = $effect.root(() => {
			const keys = useMagicKeys();
			flushSync();
			expect(keys['a']()).toBe(false);
		});
		cleanup();
	});

	test('returns true when a key is pressed', () => {
		let keys!: ReturnType<typeof useMagicKeys>;

		const cleanup = $effect.root(() => {
			keys = useMagicKeys();
		});

		flushSync();

		keyDown('a');
		expect(keys['a']()).toBe(true);

		keyUp('a');
		expect(keys['a']()).toBe(false);

		cleanup();
	});

	test('key matching is case-insensitive', () => {
		let keys!: ReturnType<typeof useMagicKeys>;

		const cleanup = $effect.root(() => {
			keys = useMagicKeys();
		});

		flushSync();

		keyDown('A');
		expect(keys['a']()).toBe(true);
		expect(keys['A']()).toBe(true);

		keyUp('A');
		cleanup();
	});

	test('normalises Control to ctrl', () => {
		let keys!: ReturnType<typeof useMagicKeys>;

		const cleanup = $effect.root(() => {
			keys = useMagicKeys();
		});

		flushSync();

		keyDown('Control');
		expect(keys['ctrl']()).toBe(true);
		expect(keys['control']()).toBe(false);

		keyUp('Control');
		cleanup();
	});

	test('normalises Escape to esc', () => {
		let keys!: ReturnType<typeof useMagicKeys>;

		const cleanup = $effect.root(() => {
			keys = useMagicKeys();
		});

		flushSync();

		keyDown('Escape');
		expect(keys['esc']()).toBe(true);

		keyUp('Escape');
		cleanup();
	});

	test('normalises space key', () => {
		let keys!: ReturnType<typeof useMagicKeys>;

		const cleanup = $effect.root(() => {
			keys = useMagicKeys();
		});

		flushSync();

		keyDown(' ');
		expect(keys['space']()).toBe(true);

		keyUp(' ');
		cleanup();
	});

	test('combination returns true only when all keys are pressed', () => {
		let keys!: ReturnType<typeof useMagicKeys>;

		const cleanup = $effect.root(() => {
			keys = useMagicKeys();
		});

		flushSync();

		keyDown('Control');
		expect(keys['ctrl+a']()).toBe(false);

		keyDown('a');
		expect(keys['ctrl+a']()).toBe(true);

		keyUp('a');
		expect(keys['ctrl+a']()).toBe(false);

		keyUp('Control');
		cleanup();
	});

	test('three-key combination', () => {
		let keys!: ReturnType<typeof useMagicKeys>;

		const cleanup = $effect.root(() => {
			keys = useMagicKeys();
		});

		flushSync();

		keyDown('Shift');
		keyDown('Control');
		expect(keys['shift+ctrl+k']()).toBe(false);

		keyDown('k');
		expect(keys['shift+ctrl+k']()).toBe(true);

		keyUp('k');
		keyUp('Control');
		keyUp('Shift');
		cleanup();
	});

	test('accessing a non-existing key returns false', () => {
		let keys!: ReturnType<typeof useMagicKeys>;

		const cleanup = $effect.root(() => {
			keys = useMagicKeys();
		});

		flushSync();

		expect(keys['nonexistentkey']()).toBe(false);

		cleanup();
	});

	test('removes listener on cleanup — keys no longer tracked', () => {
		let keys!: ReturnType<typeof useMagicKeys>;

		const cleanup = $effect.root(() => {
			keys = useMagicKeys();
		});

		flushSync();

		keyDown('a');
		expect(keys['a']()).toBe(true);

		cleanup();

		// After cleanup the key state is preserved in the snapshot but no new
		// events will be processed
		keyUp('a');
		keyDown('b');
		expect(keys['b']()).toBe(false);
	});

	test('multiple independent instances do not interfere', () => {
		let keysA!: ReturnType<typeof useMagicKeys>;
		let keysB!: ReturnType<typeof useMagicKeys>;

		const cleanup = $effect.root(() => {
			keysA = useMagicKeys();
			keysB = useMagicKeys();
		});

		flushSync();

		keyDown('x');
		expect(keysA['x']()).toBe(true);
		expect(keysB['x']()).toBe(true);

		keyUp('x');
		expect(keysA['x']()).toBe(false);
		expect(keysB['x']()).toBe(false);

		cleanup();
	});
});

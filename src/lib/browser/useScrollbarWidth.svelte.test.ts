import { describe, expect, test } from 'vitest';
import { flushSync } from 'svelte';
import { useScrollbarWidth } from './useScrollbarWidth.svelte.js';

describe('useScrollbarWidth', () => {
	test('returns zero for null target', () => {
		const cleanup = $effect.root(() => {
			const { x, y } = useScrollbarWidth(() => null);
			flushSync();
			expect(x()).toBe(0);
			expect(y()).toBe(0);
		});
		cleanup();
	});

	test('returns numbers for valid element', () => {
		const cleanup = $effect.root(() => {
			const el = document.createElement('div');
			document.body.appendChild(el);
			const { x, y } = useScrollbarWidth(() => el);
			flushSync();
			expect(typeof x()).toBe('number');
			expect(typeof y()).toBe('number');
			document.body.removeChild(el);
		});
		cleanup();
	});
});

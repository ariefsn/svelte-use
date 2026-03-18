import { describe, expect, test } from 'vitest';
import { useTextDirection } from './useTextDirection.svelte.js';

describe('useTextDirection', () => {
	test('defaults to ltr', () => {
		const cleanup = $effect.root(() => {
			const { current } = useTextDirection();
			expect(current()).toBe('ltr');
		});
		cleanup();
	});

	test('set changes direction', () => {
		const cleanup = $effect.root(() => {
			const { current, set } = useTextDirection();
			set('rtl');
			expect(current()).toBe('rtl');
		});
		cleanup();
		// Reset
		document.documentElement.setAttribute('dir', 'ltr');
	});

	test('accepts initial direction', () => {
		const cleanup = $effect.root(() => {
			const el = document.createElement('div');
			const { current } = useTextDirection({ element: el, initial: 'rtl' });
			expect(current()).toBe('rtl');
		});
		cleanup();
	});
});

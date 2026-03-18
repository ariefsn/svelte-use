import { describe, expect, test } from 'vitest';
import { useTextSelection } from './useTextSelection.svelte.js';

describe('useTextSelection', () => {
	test('starts with empty text', () => {
		const cleanup = $effect.root(() => {
			const { text } = useTextSelection();
			expect(text()).toBe('');
		});
		cleanup();
	});

	test('starts with empty rects', () => {
		const cleanup = $effect.root(() => {
			const { rects } = useTextSelection();
			expect(rects()).toEqual([]);
		});
		cleanup();
	});

	test('starts with empty ranges', () => {
		const cleanup = $effect.root(() => {
			const { ranges } = useTextSelection();
			expect(ranges()).toEqual([]);
		});
		cleanup();
	});
});

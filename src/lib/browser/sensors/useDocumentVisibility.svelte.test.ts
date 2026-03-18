import { describe, expect, test } from 'vitest';
import { useDocumentVisibility } from './useDocumentVisibility.svelte.js';

describe('useDocumentVisibility', () => {
	test('returns current visibility state', () => {
		const cleanup = $effect.root(() => {
			const { current } = useDocumentVisibility();
			expect(['visible', 'hidden']).toContain(current());
		});
		cleanup();
	});
});

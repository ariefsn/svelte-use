import { describe, expect, test } from 'vitest';
import { useActiveElement } from './useActiveElement.svelte.js';

describe('useActiveElement', () => {
	test('returns current active element', () => {
		const cleanup = $effect.root(() => {
			const { current } = useActiveElement();
			// In browser test env, activeElement is typically body or null
			expect(current() === null || current() instanceof Element).toBe(true);
		});
		cleanup();
	});
});

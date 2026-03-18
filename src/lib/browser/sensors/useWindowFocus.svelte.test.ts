import { describe, expect, test } from 'vitest';
import { useWindowFocus } from './useWindowFocus.svelte.js';

describe('useWindowFocus', () => {
	test('returns boolean focus state', () => {
		const cleanup = $effect.root(() => {
			const { focused } = useWindowFocus();
			expect(typeof focused()).toBe('boolean');
		});
		cleanup();
	});
});

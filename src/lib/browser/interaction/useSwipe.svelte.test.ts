import { describe, expect, test } from 'vitest';
import { useSwipe } from './useSwipe.svelte.js';

describe('useSwipe', () => {
	test('starts with no swiping', () => {
		const cleanup = $effect.root(() => {
			const el = document.createElement('div');
			const { isSwiping, direction } = useSwipe(() => el);
			expect(isSwiping()).toBe(false);
			expect(direction()).toBe('none');
		});
		cleanup();
	});

	test('starts with zero coords', () => {
		const cleanup = $effect.root(() => {
			const el = document.createElement('div');
			const { coordsStart, coordsEnd, lengthX, lengthY } = useSwipe(() => el);
			expect(coordsStart()).toEqual({ x: 0, y: 0 });
			expect(coordsEnd()).toEqual({ x: 0, y: 0 });
			expect(lengthX()).toBe(0);
			expect(lengthY()).toBe(0);
		});
		cleanup();
	});

	test('reset clears state', () => {
		const cleanup = $effect.root(() => {
			const el = document.createElement('div');
			const { reset, direction, isSwiping } = useSwipe(() => el);
			reset();
			expect(isSwiping()).toBe(false);
			expect(direction()).toBe('none');
		});
		cleanup();
	});
});

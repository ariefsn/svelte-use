import { describe, expect, test } from 'vitest';
import { useToggle } from './useToggle.svelte.js';

describe('useToggle', () => {
	test('defaults to false', () => {
		const cleanup = $effect.root(() => {
			const t = useToggle();
			expect(t.value).toBe(false);
		});
		cleanup();
	});

	test('accepts custom initial value', () => {
		const cleanup = $effect.root(() => {
			const t = useToggle(true);
			expect(t.value).toBe(true);
		});
		cleanup();
	});

	test('toggle() flips value from false to true', () => {
		const cleanup = $effect.root(() => {
			const t = useToggle();
			t.toggle();
			expect(t.value).toBe(true);
		});
		cleanup();
	});

	test('toggle() flips value from true to false', () => {
		const cleanup = $effect.root(() => {
			const t = useToggle(true);
			t.toggle();
			expect(t.value).toBe(false);
		});
		cleanup();
	});

	test('toggle() can be called multiple times', () => {
		const cleanup = $effect.root(() => {
			const t = useToggle();
			t.toggle();
			t.toggle();
			t.toggle();
			expect(t.value).toBe(true);
		});
		cleanup();
	});

	test('set() assigns true', () => {
		const cleanup = $effect.root(() => {
			const t = useToggle(false);
			t.set(true);
			expect(t.value).toBe(true);
		});
		cleanup();
	});

	test('set() assigns false', () => {
		const cleanup = $effect.root(() => {
			const t = useToggle(true);
			t.set(false);
			expect(t.value).toBe(false);
		});
		cleanup();
	});

	test('set() and toggle() compose correctly', () => {
		const cleanup = $effect.root(() => {
			const t = useToggle();
			t.set(true);
			t.toggle();
			expect(t.value).toBe(false);
		});
		cleanup();
	});
});

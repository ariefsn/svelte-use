import { describe, expect, test } from 'vitest';
import { useDefaultState } from './useDefaultState.svelte.js';

describe('useDefaultState', () => {
	test('defaults to the provided default value', () => {
		const cleanup = $effect.root(() => {
			const state = useDefaultState('fallback');
			expect(state.value).toBe('fallback');
		});
		cleanup();
	});

	test('accepts an initial value', () => {
		const cleanup = $effect.root(() => {
			const state = useDefaultState('fallback', 'initial');
			expect(state.value).toBe('initial');
		});
		cleanup();
	});

	test('allows setting a normal value', () => {
		const cleanup = $effect.root(() => {
			const state = useDefaultState('fallback');
			state.value = 'hello';
			expect(state.value).toBe('hello');
		});
		cleanup();
	});

	test('falls back to default when set to null', () => {
		const cleanup = $effect.root(() => {
			const state = useDefaultState('fallback');
			state.value = 'hello';
			state.value = null as any;
			expect(state.value).toBe('fallback');
		});
		cleanup();
	});

	test('falls back to default when set to undefined', () => {
		const cleanup = $effect.root(() => {
			const state = useDefaultState('fallback');
			state.value = 'hello';
			state.value = undefined as any;
			expect(state.value).toBe('fallback');
		});
		cleanup();
	});

	test('works with number values', () => {
		const cleanup = $effect.root(() => {
			const state = useDefaultState(0);
			state.value = 42;
			expect(state.value).toBe(42);
			state.value = null as any;
			expect(state.value).toBe(0);
		});
		cleanup();
	});

	test('does not fall back for falsy non-null values', () => {
		const cleanup = $effect.root(() => {
			const state = useDefaultState('fallback');
			state.value = '';
			expect(state.value).toBe('');
			state.value = 0 as any;
			expect(state.value).toBe(0);
		});
		cleanup();
	});
});

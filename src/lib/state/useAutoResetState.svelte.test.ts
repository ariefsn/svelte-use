import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { useAutoResetState } from './useAutoResetState.svelte.js';

describe('useAutoResetState', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	test('defaults to the provided default value', () => {
		const cleanup = $effect.root(() => {
			const state = useAutoResetState('default');
			expect(state.value).toBe('default');
		});
		cleanup();
	});

	test('updates value when set', () => {
		const cleanup = $effect.root(() => {
			const state = useAutoResetState('default', 1000);
			state.value = 'changed';
			expect(state.value).toBe('changed');
		});
		cleanup();
	});

	test('resets to default after delay', () => {
		const cleanup = $effect.root(() => {
			const state = useAutoResetState('default', 1000);
			state.value = 'changed';
			expect(state.value).toBe('changed');
			vi.advanceTimersByTime(1000);
			expect(state.value).toBe('default');
		});
		cleanup();
	});

	test('does not reset before delay', () => {
		const cleanup = $effect.root(() => {
			const state = useAutoResetState('default', 1000);
			state.value = 'changed';
			vi.advanceTimersByTime(500);
			expect(state.value).toBe('changed');
		});
		cleanup();
	});

	test('resets timer on subsequent changes', () => {
		const cleanup = $effect.root(() => {
			const state = useAutoResetState('default', 1000);
			state.value = 'first';
			vi.advanceTimersByTime(500);
			state.value = 'second';
			vi.advanceTimersByTime(500);
			expect(state.value).toBe('second');
			vi.advanceTimersByTime(500);
			expect(state.value).toBe('default');
		});
		cleanup();
	});

	test('uses default delay of 1000ms', () => {
		const cleanup = $effect.root(() => {
			const state = useAutoResetState('default');
			state.value = 'changed';
			vi.advanceTimersByTime(999);
			expect(state.value).toBe('changed');
			vi.advanceTimersByTime(1);
			expect(state.value).toBe('default');
		});
		cleanup();
	});

	test('works with number values', () => {
		const cleanup = $effect.root(() => {
			const state = useAutoResetState(0, 500);
			state.value = 42;
			expect(state.value).toBe(42);
			vi.advanceTimersByTime(500);
			expect(state.value).toBe(0);
		});
		cleanup();
	});
});

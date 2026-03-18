import { describe, expect, test } from 'vitest';
import { flushSync } from 'svelte';
import { useHistoryState } from './useHistoryState.svelte.js';

describe('useHistoryState', () => {
	test('starts with initial value', () => {
		const cleanup = $effect.root(() => {
			const state = useHistoryState(0);
			expect(state.value).toBe(0);
		});
		cleanup();
	});

	test('updates value', () => {
		const cleanup = $effect.root(() => {
			const state = useHistoryState(0);
			state.value = 5;
			expect(state.value).toBe(5);
		});
		cleanup();
	});

	test('undo restores previous value', () => {
		const cleanup = $effect.root(() => {
			const state = useHistoryState(0);
			flushSync();

			flushSync(() => {
				state.value = 1;
			});

			flushSync(() => {
				state.value = 2;
			});

			state.undo();
			flushSync();
			expect(state.value).toBe(1);
		});
		cleanup();
	});

	test('redo restores undone value', () => {
		const cleanup = $effect.root(() => {
			const state = useHistoryState(0);
			flushSync();

			flushSync(() => {
				state.value = 1;
			});

			state.undo();
			flushSync();

			state.redo();
			flushSync();
			expect(state.value).toBe(1);
		});
		cleanup();
	});

	test('exposes canUndo and canRedo', () => {
		const cleanup = $effect.root(() => {
			const state = useHistoryState(0);
			flushSync();
			expect(state.canUndo()).toBe(false);
			expect(state.canRedo()).toBe(false);

			flushSync(() => {
				state.value = 1;
			});

			expect(state.canUndo()).toBe(true);
		});
		cleanup();
	});

	test('works with string values', () => {
		const cleanup = $effect.root(() => {
			const state = useHistoryState('hello');
			expect(state.value).toBe('hello');
			state.value = 'world';
			expect(state.value).toBe('world');
		});
		cleanup();
	});
});

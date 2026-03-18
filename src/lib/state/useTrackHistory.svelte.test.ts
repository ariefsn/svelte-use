import { describe, expect, test } from 'vitest';
import { flushSync } from 'svelte';
import { useTrackHistory } from './useTrackHistory.svelte.js';

describe('useTrackHistory', () => {
	test('starts with initial value in history', () => {
		const cleanup = $effect.root(() => {
			let value = $state(0);
			const tracker = useTrackHistory(
				() => value,
				(v) => (value = v)
			);
			flushSync();
			expect(tracker.history().length).toBe(1);
			expect(tracker.history()[0].value).toBe(0);
		});
		cleanup();
	});

	test('tracks value changes', () => {
		const cleanup = $effect.root(() => {
			let value = $state(0);
			const tracker = useTrackHistory(
				() => value,
				(v) => (value = v)
			);
			flushSync();

			flushSync(() => {
				value = 1;
			});

			flushSync(() => {
				value = 2;
			});

			expect(tracker.history().length).toBe(3);
			expect(tracker.canUndo()).toBe(true);
		});
		cleanup();
	});

	test('undo restores previous value', () => {
		const cleanup = $effect.root(() => {
			let value = $state(0);
			const tracker = useTrackHistory(
				() => value,
				(v) => (value = v)
			);
			flushSync();

			flushSync(() => {
				value = 1;
			});

			flushSync(() => {
				value = 2;
			});

			tracker.undo();
			flushSync();
			expect(value).toBe(1);
			expect(tracker.canRedo()).toBe(true);
		});
		cleanup();
	});

	test('redo restores undone value', () => {
		const cleanup = $effect.root(() => {
			let value = $state(0);
			const tracker = useTrackHistory(
				() => value,
				(v) => (value = v)
			);
			flushSync();

			flushSync(() => {
				value = 1;
			});

			tracker.undo();
			flushSync();
			expect(value).toBe(0);

			tracker.redo();
			flushSync();
			expect(value).toBe(1);
		});
		cleanup();
	});

	test('canUndo is false when at beginning', () => {
		const cleanup = $effect.root(() => {
			let value = $state(0);
			const tracker = useTrackHistory(
				() => value,
				(v) => (value = v)
			);
			flushSync();
			expect(tracker.canUndo()).toBe(false);
		});
		cleanup();
	});

	test('canRedo is false when no undo has been performed', () => {
		const cleanup = $effect.root(() => {
			let value = $state(0);
			const tracker = useTrackHistory(
				() => value,
				(v) => (value = v)
			);
			flushSync();
			expect(tracker.canRedo()).toBe(false);
		});
		cleanup();
	});

	test('new change clears redo history', () => {
		const cleanup = $effect.root(() => {
			let value = $state(0);
			const tracker = useTrackHistory(
				() => value,
				(v) => (value = v)
			);
			flushSync();

			flushSync(() => {
				value = 1;
			});

			tracker.undo();
			flushSync();

			flushSync(() => {
				value = 5;
			});

			expect(tracker.canRedo()).toBe(false);
		});
		cleanup();
	});
});

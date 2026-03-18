import { describe, expect, test } from 'vitest';
import { useFileDialog } from './useFileDialog.svelte.js';

describe('useFileDialog', () => {
	test('starts with empty files', () => {
		const cleanup = $effect.root(() => {
			const { files } = useFileDialog();
			expect(files()).toEqual([]);
		});
		cleanup();
	});

	test('reset clears files', () => {
		const cleanup = $effect.root(() => {
			const { files, reset } = useFileDialog();
			reset();
			expect(files()).toEqual([]);
		});
		cleanup();
	});

	test('open does not throw', () => {
		const cleanup = $effect.root(() => {
			const { open } = useFileDialog();
			expect(() => open()).not.toThrow();
		});
		cleanup();
	});

	test('accepts custom options', () => {
		const cleanup = $effect.root(() => {
			const { files } = useFileDialog({ accept: 'image/*', multiple: true });
			expect(files()).toEqual([]);
		});
		cleanup();
	});
});

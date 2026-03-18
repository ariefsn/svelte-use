import { describe, expect, test, vi } from 'vitest';
import { flushSync } from 'svelte';
import { useStartTyping } from './useStartTyping.svelte.js';

describe('useStartTyping', () => {
	test('fires callback on printable key', () => {
		const callback = vi.fn();
		const cleanup = $effect.root(() => {
			useStartTyping(callback);
			flushSync();
		});

		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
		expect(callback).toHaveBeenCalledOnce();
		cleanup();
	});

	test('ignores non-printable keys', () => {
		const callback = vi.fn();
		const cleanup = $effect.root(() => {
			useStartTyping(callback);
			flushSync();
		});

		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift' }));
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }));
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
		expect(callback).not.toHaveBeenCalled();
		cleanup();
	});

	test('ignores keys with modifiers', () => {
		const callback = vi.fn();
		const cleanup = $effect.root(() => {
			useStartTyping(callback);
			flushSync();
		});

		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', ctrlKey: true }));
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', metaKey: true }));
		expect(callback).not.toHaveBeenCalled();
		cleanup();
	});
});

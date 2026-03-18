import { describe, expect, test, vi } from 'vitest';
import { flushSync } from 'svelte';
import { useEventListener } from './useEventListener.svelte.js';

describe('useEventListener', () => {
	test('adds event listener', () => {
		const handler = vi.fn();
		const cleanup = $effect.root(() => {
			useEventListener(window, 'click', handler);
			flushSync();
		});

		window.dispatchEvent(new Event('click'));
		expect(handler).toHaveBeenCalledOnce();
		cleanup();
	});

	test('removes listener on cleanup', () => {
		const handler = vi.fn();
		const cleanup = $effect.root(() => {
			useEventListener(window, 'click', handler);
			flushSync();
		});

		cleanup();
		flushSync();

		window.dispatchEvent(new Event('click'));
		expect(handler).not.toHaveBeenCalled();
	});

	test('supports multiple events', () => {
		const handler = vi.fn();
		const cleanup = $effect.root(() => {
			useEventListener(document, ['mousedown', 'mouseup'] as any, handler);
			flushSync();
		});

		document.dispatchEvent(new Event('mousedown'));
		document.dispatchEvent(new Event('mouseup'));
		expect(handler).toHaveBeenCalledTimes(2);
		cleanup();
	});

	test('returns manual cleanup function', () => {
		const handler = vi.fn();
		let manualCleanup!: () => void;
		const cleanup = $effect.root(() => {
			manualCleanup = useEventListener(window, 'resize', handler);
			flushSync();
		});

		manualCleanup();
		window.dispatchEvent(new Event('resize'));
		expect(handler).not.toHaveBeenCalled();
		cleanup();
	});
});

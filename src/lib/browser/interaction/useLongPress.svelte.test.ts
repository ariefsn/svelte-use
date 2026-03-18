import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { flushSync } from 'svelte';
import { useLongPress } from './useLongPress.svelte.js';

describe('useLongPress', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	test('fires handler after delay', () => {
		const handler = vi.fn();
		const el = document.createElement('div');
		document.body.appendChild(el);

		const cleanup = $effect.root(() => {
			useLongPress(() => el, handler, { delay: 500 });
			flushSync();
		});

		el.dispatchEvent(new PointerEvent('pointerdown', { clientX: 0, clientY: 0 }));
		vi.advanceTimersByTime(500);
		expect(handler).toHaveBeenCalledOnce();

		cleanup();
		document.body.removeChild(el);
	});

	test('does not fire if released early', () => {
		const handler = vi.fn();
		const el = document.createElement('div');
		document.body.appendChild(el);

		const cleanup = $effect.root(() => {
			useLongPress(() => el, handler, { delay: 500 });
			flushSync();
		});

		el.dispatchEvent(new PointerEvent('pointerdown', { clientX: 0, clientY: 0 }));
		vi.advanceTimersByTime(200);
		el.dispatchEvent(new PointerEvent('pointerup'));
		vi.advanceTimersByTime(300);
		expect(handler).not.toHaveBeenCalled();

		cleanup();
		document.body.removeChild(el);
	});
});

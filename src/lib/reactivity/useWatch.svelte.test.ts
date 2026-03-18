import { describe, expect, test, vi } from 'vitest';
import { flushSync } from 'svelte';
import { useWatch } from './useWatch.svelte.js';

describe('useWatch', () => {
	test('calls callback on mount by default', () => {
		const fn = vi.fn();
		const cleanup = $effect.root(() => {
			let value = $state(0);
			useWatch(() => value, fn);
			flushSync();
		});
		expect(fn).toHaveBeenCalledWith(0, undefined);
		cleanup();
	});

	test('does not call on mount when runOnMounted is false', () => {
		const fn = vi.fn();
		const cleanup = $effect.root(() => {
			let value = $state(0);
			useWatch(() => value, fn, { runOnMounted: false });
			flushSync();
		});
		expect(fn).not.toHaveBeenCalled();
		cleanup();
	});

	test('calls callback with current and previous on change', () => {
		const fn = vi.fn();
		const cleanup = $effect.root(() => {
			let value = $state(0);
			useWatch(() => value, fn);
			flushSync();
			fn.mockClear();

			flushSync(() => {
				value = 1;
			});

			expect(fn).toHaveBeenCalledWith(1, 0);
		});
		cleanup();
	});

	test('watches multiple deps as array', () => {
		const fn = vi.fn();
		const cleanup = $effect.root(() => {
			let a = $state(0);
			let b = $state('hello');
			useWatch([() => a, () => b], fn);
			flushSync();
			fn.mockClear();

			flushSync(() => {
				a = 1;
			});

			expect(fn).toHaveBeenCalledWith([1, 'hello'], [0, 'hello']);
		});
		cleanup();
	});
});

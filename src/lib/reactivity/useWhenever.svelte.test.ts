import { describe, expect, test, vi } from 'vitest';
import { flushSync } from 'svelte';
import { useWhenever } from './useWhenever.svelte.js';

describe('useWhenever', () => {
	test('calls callback on mount when truthy', () => {
		const fn = vi.fn();
		const cleanup = $effect.root(() => {
			let ready = $state(true);
			useWhenever(() => ready, fn);
			flushSync();
		});
		expect(fn).toHaveBeenCalledOnce();
		cleanup();
	});

	test('does not call callback on mount when falsy', () => {
		const fn = vi.fn();
		const cleanup = $effect.root(() => {
			let ready = $state(false);
			useWhenever(() => ready, fn);
			flushSync();
		});
		expect(fn).not.toHaveBeenCalled();
		cleanup();
	});

	test('calls callback when value becomes truthy', () => {
		const fn = vi.fn();
		const cleanup = $effect.root(() => {
			let ready = $state(false);
			useWhenever(() => ready, fn);
			flushSync();
			expect(fn).not.toHaveBeenCalled();

			flushSync(() => {
				ready = true;
			});

			expect(fn).toHaveBeenCalledOnce();
		});
		cleanup();
	});

	test('does not call callback when value stays falsy', () => {
		const fn = vi.fn();
		const cleanup = $effect.root(() => {
			let value = $state(0);
			useWhenever(() => value > 5, fn);
			flushSync();

			flushSync(() => {
				value = 3;
			});

			expect(fn).not.toHaveBeenCalled();
		});
		cleanup();
	});

	test('works with multiple deps (all must be truthy)', () => {
		const fn = vi.fn();
		const cleanup = $effect.root(() => {
			let a = $state(false);
			let b = $state(false);
			useWhenever([() => a, () => b], fn);
			flushSync();

			flushSync(() => {
				a = true;
			});
			expect(fn).not.toHaveBeenCalled();

			flushSync(() => {
				b = true;
			});
			expect(fn).toHaveBeenCalledOnce();
		});
		cleanup();
	});

	test('respects runOnMounted false', () => {
		const fn = vi.fn();
		const cleanup = $effect.root(() => {
			let ready = $state(true);
			useWhenever(() => ready, fn, { runOnMounted: false });
			flushSync();
		});
		expect(fn).not.toHaveBeenCalled();
		cleanup();
	});
});

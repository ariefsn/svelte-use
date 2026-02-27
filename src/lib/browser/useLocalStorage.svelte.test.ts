import { flushSync } from 'svelte';
import { beforeEach, describe, expect, test } from 'vitest';
import { useLocalStorage } from './useLocalStorage.svelte.js';

describe('useLocalStorage', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	test('returns the initial value when storage is empty', () => {
		const cleanup = $effect.root(() => {
			const store = useLocalStorage('key', 42);
			expect(store.value).toBe(42);
		});
		cleanup();
	});

	test('reads an existing value from localStorage', () => {
		localStorage.setItem('key', JSON.stringify(99));
		const cleanup = $effect.root(() => {
			const store = useLocalStorage('key', 0);
			expect(store.value).toBe(99);
		});
		cleanup();
	});

	test('set() updates the reactive value', () => {
		const cleanup = $effect.root(() => {
			const store = useLocalStorage('key', 0);
			store.set(7);
			expect(store.value).toBe(7);
		});
		cleanup();
	});

	test('set() persists the new value to localStorage', () => {
		const cleanup = $effect.root(() => {
			const store = useLocalStorage('key', 0);
			store.set(123);
			flushSync(); // flush $effect that writes to localStorage
			expect(JSON.parse(localStorage.getItem('key')!)).toBe(123);
		});
		cleanup();
	});

	test('persists the initial value to localStorage on first mount', () => {
		const cleanup = $effect.root(() => {
			useLocalStorage('key', 'hello');
			flushSync();
			expect(localStorage.getItem('key')).toBe(JSON.stringify('hello'));
		});
		cleanup();
	});

	test('falls back to initial on JSON parse error', () => {
		localStorage.setItem('key', '{ invalid json :::');
		const cleanup = $effect.root(() => {
			const store = useLocalStorage('key', 'fallback');
			expect(store.value).toBe('fallback');
		});
		cleanup();
	});

	test('works with object values', () => {
		const cleanup = $effect.root(() => {
			const store = useLocalStorage('obj', { name: 'Alice' });
			store.set({ name: 'Bob' });
			flushSync();
			expect(store.value).toMatchObject({ name: 'Bob' });
			expect(JSON.parse(localStorage.getItem('obj')!)).toEqual({ name: 'Bob' });
		});
		cleanup();
	});

	test('works with array values', () => {
		const cleanup = $effect.root(() => {
			const store = useLocalStorage<number[]>('arr', []);
			store.set([1, 2, 3]);
			flushSync();
			expect(store.value).toEqual([1, 2, 3]);
			expect(JSON.parse(localStorage.getItem('arr')!)).toEqual([1, 2, 3]);
		});
		cleanup();
	});

	test('reads boolean values correctly', () => {
		localStorage.setItem('flag', JSON.stringify(true));
		const cleanup = $effect.root(() => {
			const store = useLocalStorage('flag', false);
			expect(store.value).toBe(true);
		});
		cleanup();
	});

	test('two instances with different keys are independent', () => {
		const cleanup = $effect.root(() => {
			const a = useLocalStorage('a', 1);
			const b = useLocalStorage('b', 2);

			a.set(10);
			b.set(20);
			flushSync();

			expect(a.value).toBe(10);
			expect(b.value).toBe(20);
			expect(JSON.parse(localStorage.getItem('a')!)).toBe(10);
			expect(JSON.parse(localStorage.getItem('b')!)).toBe(20);
		});
		cleanup();
	});
});

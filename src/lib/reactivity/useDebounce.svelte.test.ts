import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useDebounce } from './useDebounce.svelte.js';

describe('useDebounce', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	test('returns the initial value immediately', () => {
		const cleanup = $effect.root(() => {
			let val = $state('hello');
			const debounced = useDebounce(() => val, 300);
			expect(debounced()).toBe('hello');
		});
		cleanup();
	});

	test('does not update before the delay elapses', () => {
		const cleanup = $effect.root(() => {
			let val = $state('a');
			const debounced = useDebounce(() => val, 300);

			flushSync();
			val = 'b';
			flushSync(); // effect runs: clearTimeout + new setTimeout
			vi.advanceTimersByTime(299);

			expect(debounced()).toBe('a');
		});
		cleanup();
	});

	test('updates after the delay elapses', () => {
		const cleanup = $effect.root(() => {
			let val = $state('a');
			const debounced = useDebounce(() => val, 300);

			flushSync();
			val = 'b';
			flushSync();
			vi.advanceTimersByTime(300);

			expect(debounced()).toBe('b');
		});
		cleanup();
	});

	test('resets the timer on rapid successive changes', () => {
		const cleanup = $effect.root(() => {
			let val = $state('a');
			const debounced = useDebounce(() => val, 300);

			flushSync();

			val = 'b';
			flushSync();
			vi.advanceTimersByTime(200); // 200ms into 'b' timer

			val = 'c';
			flushSync(); // cancels 'b' timer, starts 'c' timer
			vi.advanceTimersByTime(200); // total 400ms, but 'c' timer only at 200ms

			expect(debounced()).toBe('a'); // neither 'b' nor 'c' applied yet

			vi.advanceTimersByTime(100); // 'c' timer fires at 300ms
			expect(debounced()).toBe('c');
		});
		cleanup();
	});

	test('uses 300ms as the default delay', () => {
		const cleanup = $effect.root(() => {
			let val = $state('x');
			const debounced = useDebounce(() => val);

			flushSync();
			val = 'y';
			flushSync();

			vi.advanceTimersByTime(299);
			expect(debounced()).toBe('x');

			vi.advanceTimersByTime(1);
			expect(debounced()).toBe('y');
		});
		cleanup();
	});

	test('works with number values', () => {
		const cleanup = $effect.root(() => {
			let count = $state(0);
			const debounced = useDebounce(() => count, 100);

			flushSync();
			count = 42;
			flushSync();
			vi.advanceTimersByTime(100);

			expect(debounced()).toBe(42);
		});
		cleanup();
	});
});

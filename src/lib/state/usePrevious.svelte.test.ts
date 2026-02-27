import { flushSync } from 'svelte';
import { describe, expect, test } from 'vitest';
import { usePrevious } from './usePrevious.svelte.js';

describe('usePrevious', () => {
	test('returns undefined before any change', () => {
		const cleanup = $effect.root(() => {
			let count = $state(0);
			const prev = usePrevious(() => count);

			// Effect has not run yet — previous is undefined
			expect(prev()).toBeUndefined();
		});
		cleanup();
	});

	test('returns undefined after first effect run (initial value not a "change")', () => {
		const cleanup = $effect.root(() => {
			let count = $state(0);
			const prev = usePrevious(() => count);

			flushSync(); // effect runs for the first time with value 0
			expect(prev()).toBeUndefined();
		});
		cleanup();
	});

	test('returns initial value after first change', () => {
		const cleanup = $effect.root(() => {
			let count = $state(0);
			const prev = usePrevious(() => count);

			flushSync(); // first run: subscribes to count=0
			count = 1;
			flushSync(); // cleanup: previous=0 → effect runs with count=1
			expect(prev()).toBe(0);
		});
		cleanup();
	});

	test('tracks previous value across multiple changes', () => {
		const cleanup = $effect.root(() => {
			let count = $state(0);
			const prev = usePrevious(() => count);

			flushSync();

			count = 1;
			flushSync();
			expect(prev()).toBe(0);

			count = 2;
			flushSync();
			expect(prev()).toBe(1);

			count = 3;
			flushSync();
			expect(prev()).toBe(2);
		});
		cleanup();
	});

	test('works with string values', () => {
		const cleanup = $effect.root(() => {
			let name = $state('Alice');
			const prev = usePrevious(() => name);

			flushSync();
			name = 'Bob';
			flushSync();
			expect(prev()).toBe('Alice');

			name = 'Carol';
			flushSync();
			expect(prev()).toBe('Bob');
		});
		cleanup();
	});

	test('works with boolean values', () => {
		const cleanup = $effect.root(() => {
			let flag = $state(false);
			const prev = usePrevious(() => flag);

			flushSync();
			flag = true;
			flushSync();
			expect(prev()).toBe(false);
		});
		cleanup();
	});

	test('multiple independent instances do not interfere', () => {
		const cleanup = $effect.root(() => {
			let a = $state(1);
			let b = $state(10);
			const prevA = usePrevious(() => a);
			const prevB = usePrevious(() => b);

			flushSync();

			a = 2;
			b = 20;
			flushSync();

			expect(prevA()).toBe(1);
			expect(prevB()).toBe(10);
		});
		cleanup();
	});
});

import { describe, expect, test } from 'vitest';
import { useCounter } from './useCounter.svelte.js';

describe('useCounter', () => {
	test('defaults to 0', () => {
		const cleanup = $effect.root(() => {
			const c = useCounter();
			expect(c.value).toBe(0);
		});
		cleanup();
	});

	test('accepts custom initial value', () => {
		const cleanup = $effect.root(() => {
			const c = useCounter(10);
			expect(c.value).toBe(10);
		});
		cleanup();
	});

	test('inc() increments by 1', () => {
		const cleanup = $effect.root(() => {
			const c = useCounter();
			c.inc();
			expect(c.value).toBe(1);
		});
		cleanup();
	});

	test('inc(n) increments by n', () => {
		const cleanup = $effect.root(() => {
			const c = useCounter();
			c.inc(5);
			expect(c.value).toBe(5);
		});
		cleanup();
	});

	test('dec() decrements by 1', () => {
		const cleanup = $effect.root(() => {
			const c = useCounter(5);
			c.dec();
			expect(c.value).toBe(4);
		});
		cleanup();
	});

	test('dec(n) decrements by n', () => {
		const cleanup = $effect.root(() => {
			const c = useCounter(10);
			c.dec(3);
			expect(c.value).toBe(7);
		});
		cleanup();
	});

	test('reset() restores initial value after mutations', () => {
		const cleanup = $effect.root(() => {
			const c = useCounter(5);
			c.inc(10);
			c.dec(2);
			c.reset();
			expect(c.value).toBe(5);
		});
		cleanup();
	});

	test('reset() on default initial restores to 0', () => {
		const cleanup = $effect.root(() => {
			const c = useCounter();
			c.inc(99);
			c.reset();
			expect(c.value).toBe(0);
		});
		cleanup();
	});

	test('allows going below 0', () => {
		const cleanup = $effect.root(() => {
			const c = useCounter();
			c.dec(3);
			expect(c.value).toBe(-3);
		});
		cleanup();
	});

	test('accumulates multiple inc/dec calls', () => {
		const cleanup = $effect.root(() => {
			const c = useCounter(0);
			c.inc(2);
			c.inc(3);
			c.dec(1);
			expect(c.value).toBe(4);
		});
		cleanup();
	});
});

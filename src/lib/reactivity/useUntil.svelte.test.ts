import { flushSync } from 'svelte';
import { describe, expect, test, vi } from 'vitest';
import { useUntil } from './useUntil.svelte.js';

describe('useUntil', () => {
	test('resolves immediately when the condition already holds', async () => {
		const value = $state(5);

		// No state change happens after this point, so it can only resolve
		// from the initial synchronous check.
		await expect(useUntil(() => value).toBe(5)).resolves.toBe(5);
	});

	test('resolves when the value later matches', async () => {
		let count = $state(0);
		const promise = useUntil(() => count).toBe(3);

		count = 1;
		flushSync();
		count = 3;
		flushSync();

		await expect(promise).resolves.toBe(3);
	});

	test('toBeTruthy waits for a truthy value', async () => {
		let ready = $state(false);
		const promise = useUntil(() => ready).toBeTruthy();

		ready = true;
		flushSync();

		await expect(promise).resolves.toBe(true);
	});

	test('toBeFalsy waits for a falsy value', async () => {
		let loading = $state(true);
		const promise = useUntil(() => loading).toBeFalsy();

		loading = false;
		flushSync();

		await expect(promise).resolves.toBe(false);
	});

	test('toBeNullish waits for null or undefined', async () => {
		let value = $state<string | null>('present');
		const promise = useUntil(() => value).toBeNullish();

		value = null;
		flushSync();

		await expect(promise).resolves.toBeNull();
	});

	test('toMatch waits for an arbitrary predicate', async () => {
		let count = $state(0);
		const promise = useUntil(() => count).toMatch((n) => n > 10);

		count = 5;
		flushSync();
		count = 11;
		flushSync();

		await expect(promise).resolves.toBe(11);
	});

	test('changed waits for any change from the initial value', async () => {
		let value = $state('a');
		const promise = useUntil(() => value).changed();

		value = 'b';
		flushSync();

		await expect(promise).resolves.toBe('b');
	});

	test('changed does not resolve for a same-value write', async () => {
		let value = $state('a');
		const settled = vi.fn();
		useUntil(() => value)
			.changed()
			.then(settled);

		value = 'a';
		flushSync();
		await Promise.resolve();

		expect(settled).not.toHaveBeenCalled();
	});

	test('toBeDefined waits for a non-nullish value', async () => {
		let value = $state<string | null>(null);
		const promise = useUntil(() => value).toBeDefined();

		value = 'here';
		flushSync();

		await expect(promise).resolves.toBe('here');
	});

	test('toBeNaN waits for NaN', async () => {
		let value = $state(1);
		const promise = useUntil(() => value).toBeNaN();

		value = Number.NaN;
		flushSync();

		await expect(promise).resolves.toBeNaN();
	});

	test('toContain works with arrays', async () => {
		let items = $state<string[]>([]);
		const promise = useUntil(() => items).toContain('ready');

		items = ['pending'];
		flushSync();
		items = ['pending', 'ready'];
		flushSync();

		await expect(promise).resolves.toEqual(['pending', 'ready']);
	});

	test('toContain works with strings', async () => {
		let text = $state('');
		const promise = useUntil(() => text).toContain('done');

		text = 'all done here';
		flushSync();

		await expect(promise).resolves.toBe('all done here');
	});

	test('toContain works with a Set', async () => {
		let set = $state(new Set<string>());
		const promise = useUntil(() => set).toContain('x');

		set = new Set(['x']);
		flushSync();

		await expect(promise).resolves.toEqual(new Set(['x']));
	});

	test('toContain is a compile error on a value that cannot contain anything', async () => {
		const value = $state(42);

		// `UseUntilItem<number>` resolves to `never`, so this does not
		// type-check. Runtime behaviour is still defined — it never matches.
		// @ts-expect-error -- toContain is not callable on a number
		await expect(useUntil(() => value).toContain(4, { timeout: 20 })).rejects.toThrow(/timed out/);
	});

	test('toContain rejects a mismatched item type', async () => {
		const items = $state<string[]>(['a']);

		// @ts-expect-error -- item must be a string for string[]
		await expect(useUntil(() => items).toContain(42, { timeout: 20 })).rejects.toThrow(/timed out/);
	});

	test('toHaveLength matches array length', async () => {
		let items = $state<number[]>([]);
		const promise = useUntil(() => items).toHaveLength(3);

		items = [1, 2];
		flushSync();
		items = [1, 2, 3];
		flushSync();

		await expect(promise).resolves.toEqual([1, 2, 3]);
	});

	test('toHaveLength matches Map size', async () => {
		let map = $state(new Map<string, number>());
		const promise = useUntil(() => map).toHaveLength(2);

		map = new Map([
			['a', 1],
			['b', 2]
		]);
		flushSync();

		await expect(promise).resolves.toEqual(
			new Map([
				['a', 1],
				['b', 2]
			])
		);
	});

	test('not inverts a matcher', async () => {
		let status = $state('pending');
		const promise = useUntil(() => status).not.toBe('pending');

		status = 'done';
		flushSync();

		await expect(promise).resolves.toBe('done');
	});

	test('not.toContain waits for the item to disappear', async () => {
		let items = $state(['a', 'b']);
		const promise = useUntil(() => items).not.toContain('b');

		items = ['a'];
		flushSync();

		await expect(promise).resolves.toEqual(['a']);
	});

	test('not.not restores the original polarity', async () => {
		const value = $state(5);
		await expect(useUntil(() => value).not.not.toBe(5)).resolves.toBe(5);
	});

	test('changedTimes waits for N distinct changes', async () => {
		let count = $state(0);
		const promise = useUntil(() => count).changedTimes(3);

		count = 1;
		flushSync();
		count = 2;
		flushSync();
		count = 3;
		flushSync();

		await expect(promise).resolves.toBe(3);
	});

	test('changedTimes ignores same-value writes', async () => {
		let count = $state(0);
		const settled = vi.fn();
		useUntil(() => count)
			.changedTimes(2)
			.then(settled);

		count = 1;
		flushSync();
		count = 1; // no transition
		flushSync();
		await Promise.resolve();

		expect(settled).not.toHaveBeenCalled();

		count = 2;
		flushSync();
		await Promise.resolve();
	});

	test('rejects on timeout', async () => {
		const value = $state(0);
		await expect(useUntil(() => value).toBe(99, { timeout: 20 })).rejects.toThrow(
			/timed out after 20ms/
		);
	});

	test('resolves with the current value when resolveOnTimeout is set', async () => {
		const value = $state(7);
		await expect(
			useUntil(() => value).toBe(99, { timeout: 20, resolveOnTimeout: true })
		).resolves.toBe(7);
	});

	test('does not reject after it has already resolved', async () => {
		let count = $state(0);
		const promise = useUntil(() => count).toBe(1, { timeout: 50 });

		count = 1;
		flushSync();

		await expect(promise).resolves.toBe(1);
		// Outlive the timeout to prove the timer was cleared.
		await new Promise((r) => setTimeout(r, 80));
	});

	test('works outside a component scope', () => {
		// No $effect.root wrapper: useUntil creates its own, so this must not
		// throw effect_orphan.
		expect(() => useUntil(() => 1).toBe(1)).not.toThrow();
	});

	test('stops watching once settled', async () => {
		let count = $state(0);
		const source = vi.fn(() => count);
		const promise = useUntil(source).toBe(1);

		count = 1;
		flushSync();
		await promise;

		const callsWhenSettled = source.mock.calls.length;

		count = 2;
		flushSync();
		await new Promise((r) => setTimeout(r, 10));

		expect(source.mock.calls.length).toBe(callsWhenSettled);
	});
});

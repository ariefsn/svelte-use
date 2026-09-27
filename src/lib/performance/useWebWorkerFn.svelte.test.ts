import { describe, expect, test } from 'vitest';
import { useWebWorkerFn } from './useWebWorkerFn.svelte.js';

/** These use **real** workers rather than a stub. */

describe('useWebWorkerFn', () => {
	test('runs a function off the main thread and resolves its result', async () => {
		let sorter!: ReturnType<typeof useWebWorkerFn<[number[]], number[]>>;
		const cleanup = $effect.root(() => {
			sorter = useWebWorkerFn((numbers: number[]) => [...numbers].sort((a, b) => a - b));
		});

		expect(sorter.status()).toBe('PENDING');

		await expect(sorter.run([5, 1, 4, 2])).resolves.toEqual([1, 2, 4, 5]);
		expect(sorter.status()).toBe('SUCCESS');

		cleanup();
	});

	test('passes structured-cloneable arguments and results', async () => {
		let worker!: ReturnType<typeof useWebWorkerFn<[Map<string, number>], Map<string, number>>>;
		const cleanup = $effect.root(() => {
			worker = useWebWorkerFn((input: Map<string, number>) => {
				const doubled = new Map<string, number>();
				for (const [key, value] of input) doubled.set(key, value * 2);
				return doubled;
			});
		});

		const result = await worker.run(new Map([['a', 2]]));

		expect(result).toBeInstanceOf(Map);
		expect(result.get('a')).toBe(4);

		cleanup();
	});

	test('awaits an async function inside the worker', async () => {
		// Load-bearing: this file is a `.svelte.test.ts`, so the Svelte compiler rewrites the `await`
		// below to `(await $.track_reactivity_loss(p))()`.
		let worker!: ReturnType<typeof useWebWorkerFn<[number], number>>;
		const cleanup = $effect.root(() => {
			worker = useWebWorkerFn(async (value: number) => {
				await new Promise((resolve) => setTimeout(resolve, 10));
				return value + 1;
			});
		});

		await expect(worker.run(1)).resolves.toBe(2);

		cleanup();
	});

	test('rejects with the message when the function throws', async () => {
		let worker!: ReturnType<typeof useWebWorkerFn<[], never>>;
		const cleanup = $effect.root(() => {
			worker = useWebWorkerFn((): never => {
				throw new Error('boom');
			});
		});

		await expect(worker.run()).rejects.toThrow('boom');
		expect(worker.status()).toBe('ERROR');

		cleanup();
	});

	test('a function referencing its enclosing scope fails at runtime, not at the call site', async () => {
		// This is the documented constraint, pinned as a test. `outside` is not serialised with the
		// function, so the worker throws a ReferenceError.
		const outside = 42;

		let worker!: ReturnType<typeof useWebWorkerFn<[], number>>;
		const cleanup = $effect.root(() => {
			worker = useWebWorkerFn(() => outside);
		});

		await expect(worker.run()).rejects.toThrow(/outside is not defined|not defined/);
		expect(worker.status()).toBe('ERROR');

		cleanup();
	});

	test('times out a run that takes too long', async () => {
		let worker!: ReturnType<typeof useWebWorkerFn<[], string>>;
		const cleanup = $effect.root(() => {
			worker = useWebWorkerFn(
				() =>
					new Promise<string>((resolve) => {
						setTimeout(() => resolve('too late'), 2000);
					}),
				{ timeout: 50 }
			);
		});

		await expect(worker.run()).rejects.toThrow(/exceeded 50ms/);
		expect(worker.status()).toBe('TIMEOUT');

		cleanup();
	});

	test('terminate() rejects the pending run', async () => {
		let worker!: ReturnType<typeof useWebWorkerFn<[], string>>;
		const cleanup = $effect.root(() => {
			worker = useWebWorkerFn(
				() =>
					new Promise<string>((resolve) => {
						setTimeout(() => resolve('never'), 2000);
					})
			);
		});

		const pending = worker.run();
		expect(worker.status()).toBe('RUNNING');

		worker.terminate();

		await expect(pending).rejects.toThrow(/terminated/);
		// Must leave RUNNING, or any UI gated on it is stranded — a button
		// disabled while RUNNING would never re-enable.
		expect(worker.status()).toBe('TERMINATED');

		cleanup();
	});

	test('terminate() while idle does not report a cancellation', async () => {
		let worker!: ReturnType<typeof useWebWorkerFn<[], number>>;
		const cleanup = $effect.root(() => {
			worker = useWebWorkerFn(() => 1);
		});

		worker.terminate();
		expect(worker.status()).toBe('PENDING');

		// And a completed run is not retroactively marked cancelled.
		await worker.run();
		expect(worker.status()).toBe('SUCCESS');
		worker.terminate();
		expect(worker.status()).toBe('SUCCESS');

		cleanup();
	});

	test('a terminated run can be run again', async () => {
		let worker!: ReturnType<typeof useWebWorkerFn<[number], number>>;
		const cleanup = $effect.root(() => {
			worker = useWebWorkerFn(
				(value: number) =>
					new Promise<number>((resolve) => {
						setTimeout(() => resolve(value), 30);
					})
			);
		});

		const abandoned = worker.run(1);
		worker.terminate();
		await expect(abandoned).rejects.toThrow(/terminated/);

		await expect(worker.run(2)).resolves.toBe(2);
		expect(worker.status()).toBe('SUCCESS');

		cleanup();
	});

	test('a second run supersedes the first', async () => {
		let worker!: ReturnType<typeof useWebWorkerFn<[number], number>>;
		const cleanup = $effect.root(() => {
			worker = useWebWorkerFn(
				(value: number) =>
					new Promise<number>((resolve) => {
						setTimeout(() => resolve(value), 30);
					})
			);
		});

		const first = worker.run(1);
		const second = worker.run(2);

		// Starting a run cancels the previous one rather than racing it.
		await expect(first).rejects.toThrow(/terminated/);
		await expect(second).resolves.toBe(2);

		cleanup();
	});

	test('each run gets a fresh scope, so nothing leaks between runs', async () => {
		let worker!: ReturnType<typeof useWebWorkerFn<[], number>>;
		const cleanup = $effect.root(() => {
			// A module-level counter inside the worker would grow if the same
			// worker were reused.
			worker = useWebWorkerFn(() => {
				const scope = globalThis as unknown as { __calls?: number };
				scope.__calls = (scope.__calls ?? 0) + 1;
				return scope.__calls;
			});
		});

		await expect(worker.run()).resolves.toBe(1);
		await expect(worker.run()).resolves.toBe(1);

		cleanup();
	});

	test('reports support', () => {
		const cleanup = $effect.root(() => {
			expect(useWebWorkerFn(() => 1).isSupported()).toBe(true);
		});
		cleanup();
	});
});

import { flushSync } from 'svelte';
import { describe, expect, test, vi } from 'vitest';
import { useAsyncQueue } from './useAsyncQueue.svelte.js';

/** Resolves after `ms`, recording order via the shared log. */
function delayed<T>(value: T, ms: number, log?: string[], label?: string) {
	return () =>
		new Promise<T>((resolve) => {
			setTimeout(() => {
				if (log && label) log.push(label);
				resolve(value);
			}, ms);
		});
}

/** Waits until the queue settles. */
async function drained(isFinished: () => boolean, timeoutMs = 2000) {
	const deadline = Date.now() + timeoutMs;
	while (!isFinished() && Date.now() < deadline) {
		await new Promise((resolve) => setTimeout(resolve, 5));
		flushSync();
	}
	flushSync();
}

describe('useAsyncQueue', () => {
	test('runs every task and records its result', async () => {
		let queue!: ReturnType<typeof useAsyncQueue<number>>;
		const cleanup = $effect.root(() => {
			queue = useAsyncQueue([delayed(1, 5), delayed(2, 5), delayed(3, 5)]);
		});

		await drained(queue.isFinished);

		expect(queue.tasks().map((t) => t.status)).toEqual(['fulfilled', 'fulfilled', 'fulfilled']);
		expect(queue.tasks().map((t) => t.data)).toEqual([1, 2, 3]);
		expect(queue.settled()).toBe(3);
		expect(queue.isRunning()).toBe(false);

		cleanup();
	});

	test('concurrency 1 runs tasks strictly in series', async () => {
		const log: string[] = [];

		let queue!: ReturnType<typeof useAsyncQueue<string>>;
		const cleanup = $effect.root(() => {
			queue = useAsyncQueue([
				delayed('a', 30, log, 'a'),
				delayed('b', 5, log, 'b'),
				delayed('c', 5, log, 'c')
			]);
		});

		await drained(queue.isFinished);

		// Despite 'a' being slowest, order is preserved because nothing
		// overlaps.
		expect(log).toEqual(['a', 'b', 'c']);

		cleanup();
	});

	test('higher concurrency overlaps tasks', async () => {
		const log: string[] = [];

		let queue!: ReturnType<typeof useAsyncQueue<string>>;
		const cleanup = $effect.root(() => {
			queue = useAsyncQueue([delayed('slow', 40, log, 'slow'), delayed('fast', 5, log, 'fast')], {
				concurrency: 2
			});
		});

		await drained(queue.isFinished);

		// Both started together, so the quick one finishes first.
		expect(log).toEqual(['fast', 'slow']);
		// Results stay in task order regardless of completion order.
		expect(queue.tasks().map((t) => t.data)).toEqual(['slow', 'fast']);

		cleanup();
	});

	test('aborts the remaining tasks when one rejects', async () => {
		const third = vi.fn(async () => 3);

		let queue!: ReturnType<typeof useAsyncQueue<number>>;
		const cleanup = $effect.root(() => {
			queue = useAsyncQueue([delayed(1, 5), () => Promise.reject(new Error('boom')), third]);
		});

		await drained(queue.isFinished);

		expect(queue.tasks()[0].status).toBe('fulfilled');
		expect(queue.tasks()[1].status).toBe('rejected');
		expect(queue.tasks()[1].error?.message).toBe('boom');
		expect(queue.tasks()[2].status).toBe('aborted');
		// The aborted task never ran at all.
		expect(third).not.toHaveBeenCalled();

		cleanup();
	});

	test('abortOnError false runs everything and collects failures', async () => {
		const third = vi.fn(async () => 3);

		let queue!: ReturnType<typeof useAsyncQueue<number>>;
		const cleanup = $effect.root(() => {
			queue = useAsyncQueue([delayed(1, 5), () => Promise.reject(new Error('boom')), third], {
				abortOnError: false
			});
		});

		await drained(queue.isFinished);

		expect(queue.tasks().map((t) => t.status)).toEqual(['fulfilled', 'rejected', 'fulfilled']);
		expect(third).toHaveBeenCalled();

		cleanup();
	});

	test('calls onSuccess with the data and its index', async () => {
		// The counterpart to onError: without it there is no hook for updating
		// the row that just finished.
		const onSuccess = vi.fn();

		let queue!: ReturnType<typeof useAsyncQueue<string>>;
		const cleanup = $effect.root(() => {
			queue = useAsyncQueue([delayed('a', 5), delayed('b', 5)], { onSuccess });
		});

		await drained(queue.isFinished);

		expect(onSuccess).toHaveBeenCalledTimes(2);
		expect(onSuccess).toHaveBeenNthCalledWith(1, 'a', 0);
		expect(onSuccess).toHaveBeenNthCalledWith(2, 'b', 1);

		cleanup();
	});

	test('onSuccess indices match the input array even when tasks finish out of order', async () => {
		const seen: [string, number][] = [];

		let queue!: ReturnType<typeof useAsyncQueue<string>>;
		const cleanup = $effect.root(() => {
			queue = useAsyncQueue([delayed('slow', 40), delayed('fast', 5)], {
				concurrency: 2,
				onSuccess: (data, index) => seen.push([data, index])
			});
		});

		await drained(queue.isFinished);

		// 'fast' lands first but keeps index 1, so a per-row update targets the
		// right row rather than the completion order.
		expect(seen).toEqual([
			['fast', 1],
			['slow', 0]
		]);

		cleanup();
	});

	test('onSuccess does not fire for a rejected or aborted task', async () => {
		const onSuccess = vi.fn();

		let queue!: ReturnType<typeof useAsyncQueue<number>>;
		const cleanup = $effect.root(() => {
			queue = useAsyncQueue([() => Promise.reject(new Error('boom')), delayed(2, 5)], {
				onSuccess
			});
		});

		await drained(queue.isFinished);

		expect(onSuccess).not.toHaveBeenCalled();

		cleanup();
	});

	test('calls onError with the index and onFinished once', async () => {
		const onError = vi.fn();
		const onFinished = vi.fn();

		let queue!: ReturnType<typeof useAsyncQueue<number>>;
		const cleanup = $effect.root(() => {
			queue = useAsyncQueue([delayed(1, 5), () => Promise.reject(new Error('nope'))], {
				abortOnError: false,
				onError,
				onFinished
			});
		});

		await drained(queue.isFinished);

		expect(onError).toHaveBeenCalledWith(expect.any(Error), 1);
		expect(onFinished).toHaveBeenCalledTimes(1);

		cleanup();
	});

	test('abort() marks pending tasks aborted and stops starting new ones', async () => {
		const later = vi.fn(async () => 2);

		let queue!: ReturnType<typeof useAsyncQueue<number>>;
		const cleanup = $effect.root(() => {
			queue = useAsyncQueue([delayed(1, 20), later]);
		});

		queue.abort();
		flushSync();

		expect(queue.tasks()[1].status).toBe('aborted');
		expect(later).not.toHaveBeenCalled();

		cleanup();
	});

	test('settled drives a progress display reactively', async () => {
		let queue!: ReturnType<typeof useAsyncQueue<number>>;
		const cleanup = $effect.root(() => {
			queue = useAsyncQueue([delayed(1, 5), delayed(2, 10)]);
		});

		expect(queue.settled()).toBe(0);
		await drained(queue.isFinished);
		expect(queue.settled()).toBe(2);

		cleanup();
	});

	test('an empty queue is finished immediately', () => {
		const cleanup = $effect.root(() => {
			const queue = useAsyncQueue<number>([]);
			expect(queue.isFinished()).toBe(true);
			expect(queue.isRunning()).toBe(false);
		});
		cleanup();
	});

	test('wraps a non-Error rejection', async () => {
		let queue!: ReturnType<typeof useAsyncQueue<number>>;
		const cleanup = $effect.root(() => {
			queue = useAsyncQueue([() => Promise.reject('just a string')]);
		});

		await drained(queue.isFinished);

		expect(queue.tasks()[0].error).toBeInstanceOf(Error);
		expect(queue.tasks()[0].error?.message).toBe('just a string');

		cleanup();
	});
});

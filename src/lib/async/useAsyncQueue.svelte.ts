/** State of one task in the queue. */
export type AsyncQueueTaskStatus = 'pending' | 'running' | 'fulfilled' | 'rejected' | 'aborted';

/** One task's result. */
export interface AsyncQueueTask<T> {
	status: AsyncQueueTaskStatus;
	/** What it resolved to, or `null` until it does. */
	data: T | null;
	/** Why it failed, or `null`. */
	error: Error | null;
}

/** Options for `useAsyncQueue`. */
export interface UseAsyncQueueOptions<T> {
	/**
	 * How many tasks may run at once.
	 *
	 * `1` runs them strictly in series, which is the point when each task
	 * depends on the one before.
	 * @default 1
	 */
	concurrency?: number;
	/**
	 * Stop the queue when a task rejects, marking the rest `aborted`.
	 *
	 * Leave it on for a dependent sequence; turn it off to run everything and
	 * collect the failures.
	 * @default true
	 */
	abortOnError?: boolean;
	/** Called once every task has settled. */
	onFinished?: () => void;
	/**
	 * Called when a task resolves, with its index in the original array.
	 *
	 * The counterpart to `onError`: together they let a per-row UI update as
	 * each task lands, rather than only once the whole queue is done.
	 */
	onSuccess?: (data: T, index: number) => void;
	/** Called when a task rejects, with its index in the original array. */
	onError?: (error: Error, index: number) => void;
}

/** Return value of `useAsyncQueue`. */
export interface UseAsyncQueueReturn<T> {
	/** Per-task state, in the order the tasks were given. */
	tasks: () => readonly AsyncQueueTask<T>[];
	/** Whether anything is still running or pending. */
	isRunning: () => boolean;
	/** Whether every task has settled. */
	isFinished: () => boolean;
	/** How many tasks have settled, for a progress display. */
	settled: () => number;
	/** Marks everything unsettled as aborted and stops starting new work. */
	abort: () => void;
}

/**
 * Runs a list of async tasks with bounded concurrency, tracking each one.
 *
 * `useAsyncState` covers a single execution; this covers a batch where you
 * need per-task status — uploading ten files and showing which succeeded,
 * or a dependent sequence that should stop at the first failure.
 *
 * Tasks start as soon as the composable is created. Already-running tasks
 * cannot be cancelled by `abort()` — a `Promise` has no cancellation — so it
 * stops *starting* new ones and marks the unsettled as aborted. Give each task
 * an `AbortSignal` of your own if the work itself must stop.
 *
 * @template T - What the tasks resolve to
 * @param tasks - The functions to run, each returning a promise
 * @param options - Concurrency and failure behaviour
 * @returns Per-task state plus `abort`
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useAsyncQueue } from '@ariefsn/svelte-use';
 *
 *   let { files }: { files: File[] } = $props();
 *
 *   const queue = useAsyncQueue(
 *     files.map((file) => () => upload(file)),
 *     { concurrency: 3, abortOnError: false }
 *   );
 * </script>
 *
 * <progress value={queue.settled()} max={queue.tasks().length}></progress>
 * {#each queue.tasks() as task, i (i)}
 *   <li>{files[i].name} — {task.status}</li>
 * {/each}
 * ```
 */
export function useAsyncQueue<T>(
	tasks: readonly (() => Promise<T>)[],
	options: UseAsyncQueueOptions<T> = {}
): UseAsyncQueueReturn<T> {
	const { concurrency = 1, abortOnError = true, onFinished, onSuccess, onError } = options;

	let states = $state<AsyncQueueTask<T>[]>(
		tasks.map(() => ({ status: 'pending', data: null, error: null }))
	);

	// Plain `let`: scheduling bookkeeping, never reactive.
	let nextIndex = 0;
	let active = 0;
	let stopped = false;
	let finishedAnnounced = false;

	const settled = $derived(
		states.filter(
			(task) =>
				task.status === 'fulfilled' || task.status === 'rejected' || task.status === 'aborted'
		).length
	);
	const isFinished = $derived(settled === states.length);

	function update(index: number, patch: Partial<AsyncQueueTask<T>>): void {
		// A new array so the change is visible to `$derived`; the tasks are
		// plain data, so this is cheap.
		states = states.map((task, i) => (i === index ? { ...task, ...patch } : task));
	}

	function announceIfFinished(): void {
		if (finishedAnnounced) return;
		if (states.every((task) => task.status !== 'pending' && task.status !== 'running')) {
			finishedAnnounced = true;
			onFinished?.();
		}
	}

	function abortRemaining(): void {
		stopped = true;
		states = states.map((task) =>
			task.status === 'pending' ? { ...task, status: 'aborted' as const } : task
		);
		announceIfFinished();
	}

	function pump(): void {
		while (!stopped && active < concurrency && nextIndex < tasks.length) {
			const index = nextIndex++;
			const task = tasks[index];
			active += 1;
			update(index, { status: 'running' });

			// Runs in a promise callback, outside any tracking pass, so writing
			// state here cannot re-trigger an effect that scheduled it.
			task().then(
				(data) => {
					active -= 1;
					update(index, { status: 'fulfilled', data });
					onSuccess?.(data, index);
					announceIfFinished();
					pump();
				},
				(cause: unknown) => {
					active -= 1;
					const error = cause instanceof Error ? cause : new Error(String(cause));
					update(index, { status: 'rejected', error });
					onError?.(error, index);
					if (abortOnError) abortRemaining();
					else {
						announceIfFinished();
						pump();
					}
				}
			);
		}

		announceIfFinished();
	}

	pump();

	// Dependency-free: stops scheduling further work once the scope is gone.
	$effect(() => () => {
		stopped = true;
	});

	return {
		tasks: () => states,
		isRunning: () => !isFinished,
		isFinished: () => isFinished,
		settled: () => settled,
		abort: abortRemaining
	};
}

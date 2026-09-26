import { useSupported } from '../browser/useSupported.svelte.js';

/**
 * Lifecycle state of the most recent `run()`.
 *
 * `TERMINATED` is distinct from `ERROR`: the run was cancelled deliberately,
 * by `terminate()` or by a newer run superseding it, rather than failing.
 */
export type WebWorkerStatus =
	| 'PENDING'
	| 'RUNNING'
	| 'SUCCESS'
	| 'ERROR'
	| 'TIMEOUT'
	| 'TERMINATED';

/**
 * Stands in for Svelte's internal namespace inside the worker.
 *
 * The Svelte compiler rewrites **every `await`** in a `.svelte` or
 * `.svelte.ts` module to `(await $.track_reactivity_loss(promise))()`, where
 * `$` is its client-internals import. That name does not exist in a worker, so
 * without this shim any async function written in a component file fails with
 * a bare `$ is not defined` — and only sometimes, since the instrumentation is
 * a development-mode warning aid.
 *
 * The real helper awaits the promise and returns a thunk yielding its value,
 * doing reactivity bookkeeping on the side. A worker has no effects to track,
 * so reproducing just the await-and-thunk behaviour is faithful.
 *
 * `$` is therefore a reserved name in the worker scope. Existing definitions
 * (from an `importScripts` dependency) are preserved rather than replaced.
 */
const SVELTE_AWAIT_SHIM = `
var $ = self.$ || {};
if (!$.track_reactivity_loss) {
	$.track_reactivity_loss = async (promise) => { const value = await promise; return () => value; };
}
if (!$.for_await_track_reactivity_loss) {
	$.for_await_track_reactivity_loss = async function* (iterable) { yield* iterable; };
}`;

/** Options for `useWebWorkerFn`. */
export interface UseWebWorkerFnOptions {
	/**
	 * Milliseconds before a run is abandoned and the worker terminated.
	 * Omit for no limit.
	 */
	timeout?: number;
	/**
	 * Scripts to `importScripts()` inside the worker, as absolute URLs.
	 *
	 * This is the supported way to give the function code it does not carry
	 * itself, since the function is serialised without its surrounding scope.
	 * @default []
	 */
	dependencies?: readonly string[];
}

/** Return value of `useWebWorkerFn`. */
export interface UseWebWorkerFnReturn<TArgs extends readonly unknown[], TResult> {
	/** Whether `Worker`, `Blob` and `URL.createObjectURL` are all available. */
	isSupported: () => boolean;
	/** Runs the function off the main thread. Starting a run cancels the previous one. */
	run: (...args: TArgs) => Promise<TResult>;
	/** State of the most recent run. */
	status: () => WebWorkerStatus;
	/** Terminates the running worker, if any. The pending promise rejects. */
	terminate: () => void;
}

/**
 * Runs a function on a Web Worker, off the main thread.
 *
 * **The function is serialised with `Function.prototype.toString()` and must
 * be entirely self-contained.** It runs in a fresh worker scope with no access
 * to imports, module-level constants, closures or anything else from the file
 * it was written in — referencing any of them throws inside the worker rather
 * than at the call site. Pass everything it needs as arguments, or load it
 * with `dependencies`.
 *
 * Arguments and the return value cross by structured clone, so they may be
 * objects, `Map`, `Set`, `Date` or typed arrays, but not functions, DOM nodes
 * or class instances with behaviour. TypeScript cannot check this; it fails at
 * runtime with a `DataCloneError`.
 *
 * Each `run()` uses a fresh worker, so no state leaks between runs, and
 * starting a run cancels any previous one.
 *
 * SSR: `isSupported()` is `false` and `run()` rejects.
 *
 * @template TArgs - The function's parameters
 * @template TResult - What it resolves to
 * @param fn - A self-contained function to run off-thread
 * @param options - Timeout and `importScripts` dependencies
 * @returns `run`, `status`, `terminate` and `isSupported`
 *
 * @example
 * ```ts
 * // Self-contained: everything it uses is either an argument or built in
 * const sorter = useWebWorkerFn((numbers: number[]) =>
 *   [...numbers].sort((a, b) => a - b)
 * );
 *
 * const sorted = await sorter.run([5, 1, 4]);
 * sorter.status(); // → 'SUCCESS'
 * ```
 */
export function useWebWorkerFn<TArgs extends readonly unknown[], TResult>(
	fn: (...args: TArgs) => TResult | Promise<TResult>,
	options: UseWebWorkerFnOptions = {}
): UseWebWorkerFnReturn<TArgs, TResult> {
	const { timeout, dependencies = [] } = options;

	const isSupported = useSupported(
		() =>
			typeof Worker === 'function' &&
			typeof Blob === 'function' &&
			typeof URL?.createObjectURL === 'function'
	);

	let status = $state<WebWorkerStatus>('PENDING');

	// Plain `let`: worker bookkeeping, never reactive.
	let worker: Worker | null = null;
	let objectUrl: string | null = null;
	let timer: ReturnType<typeof setTimeout> | null = null;
	let rejectPending: ((reason: Error) => void) | null = null;

	function cleanup(): void {
		if (timer !== null) {
			clearTimeout(timer);
			timer = null;
		}
		worker?.terminate();
		worker = null;
		if (objectUrl !== null) {
			// Every createObjectURL leaks until revoked; the worker is gone, so
			// nothing can still need it.
			URL.revokeObjectURL(objectUrl);
			objectUrl = null;
		}
	}

	function terminate(): void {
		const reject = rejectPending;
		rejectPending = null;
		cleanup();

		// Only move the status when a run was actually cancelled. Terminating
		// while idle should not report a cancellation that never happened —
		// and leaving it on RUNNING would strand any UI gated on that.
		if (reject) {
			status = 'TERMINATED';
			reject(new Error('The worker was terminated.'));
		}
	}

	function createWorkerUrl(): string {
		const imports =
			dependencies.length > 0
				? `importScripts(${dependencies.map((url) => JSON.stringify(url)).join(',')});`
				: '';

		const source = `
${imports}
${SVELTE_AWAIT_SHIM}
const __run = ${fn.toString()};
self.onmessage = async (event) => {
	try {
		const result = await __run(...event.data);
		self.postMessage({ ok: true, result });
	} catch (error) {
		self.postMessage({ ok: false, message: error instanceof Error ? error.message : String(error) });
	}
};`;

		return URL.createObjectURL(new Blob([source], { type: 'application/javascript' }));
	}

	function run(...args: TArgs): Promise<TResult> {
		if (!isSupported()) {
			return Promise.reject(new Error('Web Workers are not available in this environment.'));
		}

		// A new run supersedes the old one rather than racing it.
		terminate();
		status = 'RUNNING';

		return new Promise<TResult>((resolve, reject) => {
			rejectPending = reject;

			let instance: Worker;
			try {
				objectUrl = createWorkerUrl();
				instance = new Worker(objectUrl);
			} catch (cause) {
				rejectPending = null;
				cleanup();
				status = 'ERROR';
				reject(cause instanceof Error ? cause : new Error(String(cause)));
				return;
			}

			worker = instance;

			/** Ends this run, ignoring anything a superseded worker sends later. */
			const settle = (finish: () => void, next: WebWorkerStatus) => {
				if (worker !== instance) return;
				rejectPending = null;
				cleanup();
				status = next;
				finish();
			};

			instance.onmessage = (
				event: MessageEvent<{ ok: true; result: TResult } | { ok: false; message: string }>
			) => {
				const payload = event.data;
				if (payload.ok) settle(() => resolve(payload.result), 'SUCCESS');
				else settle(() => reject(new Error(payload.message)), 'ERROR');
			};

			instance.onerror = (event: ErrorEvent) => {
				settle(() => reject(new Error(event.message || 'The worker failed.')), 'ERROR');
			};

			if (timeout !== undefined) {
				timer = setTimeout(() => {
					settle(() => reject(new Error(`The worker exceeded ${timeout}ms.`)), 'TIMEOUT');
				}, timeout);
			}

			// Hand the arguments over — this is what invokes the function. The
			// worker's `self.onmessage` does nothing until it receives them.
			try {
				instance.postMessage(args);
			} catch (cause) {
				// A non-cloneable argument throws here, synchronously, rather
				// than failing silently inside the worker.
				settle(() => reject(cause instanceof Error ? cause : new Error(String(cause))), 'ERROR');
			}
		});
	}

	// Dependency-free: reading anything here would re-run and kill a worker
	// that the previous run had just started.
	$effect(() => () => {
		rejectPending = null;
		cleanup();
	});

	return {
		isSupported,
		run,
		status: () => status,
		terminate
	};
}

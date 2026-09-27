import { useSupported } from '../browser/useSupported.svelte.js';

/** Lifecycle state of the most recent `run()`. */
export type WebWorkerStatus =
	| 'PENDING'
	| 'RUNNING'
	| 'SUCCESS'
	| 'ERROR'
	| 'TIMEOUT'
	| 'TERMINATED';

/** Stands in for Svelte's internal namespace inside the worker. */
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
	/** Milliseconds before a run is abandoned and the worker terminated. Omit for no limit. */
	timeout?: number;
	/** Scripts to `importScripts()` inside the worker, as absolute URLs. Default `[]`. */
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

/** Runs a function on a Web Worker, off the main thread. */
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

		// Only move the status when a run was actually cancelled.
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

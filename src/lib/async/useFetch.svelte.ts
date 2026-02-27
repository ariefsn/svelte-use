export interface UseFetchOptions {
	/**
	 * Whether to execute the fetch immediately when the composable is created,
	 * and whenever the `url` changes. Default: `true`.
	 */
	immediate?: boolean;
	/**
	 * Optional `RequestInit` options forwarded to every `fetch` call.
	 */
	init?: RequestInit;
}

export interface UseFetchReturn<T> {
	/** Reactive getter returning the parsed response data, or `null` before the first successful response. */
	data: () => T | null;
	/** Reactive getter returning the last `Error`, or `null` when no error has occurred. */
	error: () => Error | null;
	/** Reactive getter returning `true` while a request is in-flight. */
	isFetching: () => boolean;
	/** Manually trigger a fetch. Aborts any in-flight request before starting a new one. */
	execute: () => Promise<void>;
}

/**
 * Reactive fetch utility with automatic re-execution when the URL changes,
 * in-flight request abortion via `AbortController`, and full SSR safety.
 *
 * @template T - The expected shape of the parsed JSON response body.
 *
 * @param url - Reactive getter returning the URL to fetch, or `undefined` to
 *   skip fetching.
 * @param options - Optional configuration.
 * @param options.immediate - Auto-execute on mount and on URL change (default: `true`).
 * @param options.init - `RequestInit` options forwarded to every `fetch` call.
 * @returns Reactive state object with `data`, `error`, `isFetching`, and `execute`.
 *
 * @example
 * ```ts
 * let id = $state(1);
 * const { data, error, isFetching, execute } = useFetch<User>(
 *   () => `/api/users/${id}`
 * );
 * // Refetch by changing the URL:
 * id = 2; // triggers re-fetch automatically
 * // Or trigger manually:
 * await execute();
 * ```
 */
export function useFetch<T>(
	url: () => string | undefined,
	options: UseFetchOptions = {}
): UseFetchReturn<T> {
	const { immediate = true, init } = options;

	let data = $state<T | null>(null);
	let error = $state<Error | null>(null);
	let isFetching = $state(false);

	let controller: AbortController | null = null;

	function abort() {
		if (controller !== null) {
			controller.abort();
			controller = null;
		}
	}

	async function execute(): Promise<void> {
		const resolvedUrl = url();
		if (resolvedUrl === undefined) return;

		// Guard: fetch is not available in some SSR environments
		if (typeof fetch === 'undefined') return;

		abort();

		controller = new AbortController();
		const signal = controller.signal;

		isFetching = true;
		error = null;

		try {
			const response = await fetch(resolvedUrl, { ...init, signal });

			if (!response.ok) {
				throw new Error(`Request failed with status ${response.status}`);
			}

			data = (await response.json()) as T;
		} catch (err) {
			if (err instanceof Error && err.name === 'AbortError') {
				return;
			}
			error = err instanceof Error ? err : new Error(String(err));
		} finally {
			if (!signal.aborted) {
				isFetching = false;
				controller = null;
			}
		}
	}

	$effect(() => {
		// Track the url reactively so a change triggers re-execution
		const resolvedUrl = url();

		if (!immediate || resolvedUrl === undefined) return;

		execute();

		return () => {
			abort();
		};
	});

	return {
		data: () => data,
		error: () => error,
		isFetching: () => isFetching,
		execute
	};
}

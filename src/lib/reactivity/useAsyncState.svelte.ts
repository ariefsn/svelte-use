/* eslint-disable @typescript-eslint/no-explicit-any --
 * `(...args: any[])` is a variadic pass-through to the caller's own promise factory;
 * `unknown[]` would reject ordinary typed factories. The resolved value stays typed as `T`.
 */
export interface UseAsyncStateOptions<T> {
	/** Execute immediately on creation (default: `true`) */
	immediate?: boolean;
	/** Reset to initial value on each execute (default: `false`) */
	resetOnExecute?: boolean;
	/** Callback on successful resolution */
	onSuccess?: (data: T) => void;
	/** Callback on error */
	onError?: (error: unknown) => void;
}

export interface UseAsyncStateReturn<T> {
	/** Whether the promise has resolved at least once */
	isReady: () => boolean;
	/** Whether the promise is currently pending */
	isLoading: () => boolean;
	/** The resolved data value */
	current: () => T;
	/** The error if the promise rejected, or null */
	error: () => unknown | null;
	/** Manually execute/re-execute the async function */
	execute: (...args: any[]) => Promise<T>;
}

/** Reactive wrapper around async operations, tracking loading and error states. */
export function useAsyncState<T>(
	promise: ((...args: any[]) => Promise<T>) | Promise<T>,
	initial: T,
	options: UseAsyncStateOptions<T> = {}
): UseAsyncStateReturn<T> {
	const { immediate = true, resetOnExecute = false, onSuccess, onError } = options;

	let data = $state<T>(initial);
	let isReady = $state(false);
	let isLoading = $state(false);
	let error = $state<unknown | null>(null);

	async function execute(...args: any[]): Promise<T> {
		if (resetOnExecute) {
			data = initial;
		}
		isLoading = true;
		error = null;

		try {
			const result = typeof promise === 'function' ? await promise(...args) : await promise;
			data = result;
			isReady = true;
			onSuccess?.(result);
			return result;
		} catch (e) {
			error = e;
			onError?.(e);
			return data;
		} finally {
			isLoading = false;
		}
	}

	if (immediate) {
		execute();
	}

	return {
		isReady: () => isReady,
		isLoading: () => isLoading,
		current: () => data,
		error: () => error,
		execute
	};
}

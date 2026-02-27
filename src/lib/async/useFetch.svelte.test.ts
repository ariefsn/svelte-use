import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useFetch } from './useFetch.svelte.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockFetchOnce(body: unknown, status = 200) {
	vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
		new Response(JSON.stringify(body), {
			status,
			headers: { 'Content-Type': 'application/json' }
		})
	);
}

function mockFetchError(message: string) {
	vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error(message));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useFetch', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	// -------------------------------------------------------------------------
	// Default behavior
	// -------------------------------------------------------------------------

	test('initial state: data null, error null, isFetching false', () => {
		const cleanup = $effect.root(() => {
			vi.spyOn(globalThis, 'fetch').mockResolvedValue(
				new Response(JSON.stringify(null), { status: 200 })
			);
			const { data, error, isFetching } = useFetch<unknown>(() => undefined);
			expect(data()).toBeNull();
			expect(error()).toBeNull();
			expect(isFetching()).toBe(false);
		});
		cleanup();
	});

	test('does not fetch when url is undefined', () => {
		const fetchSpy = vi.spyOn(globalThis, 'fetch');
		const cleanup = $effect.root(() => {
			useFetch<unknown>(() => undefined);
			flushSync();
		});
		cleanup();
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	test('does not fetch when immediate is false', () => {
		const fetchSpy = vi.spyOn(globalThis, 'fetch');
		const cleanup = $effect.root(() => {
			useFetch<unknown>(() => 'https://example.com/api', { immediate: false });
			flushSync();
		});
		cleanup();
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	// -------------------------------------------------------------------------
	// Success case
	// -------------------------------------------------------------------------

	test('fetches immediately and populates data on success', async () => {
		mockFetchOnce({ id: 1, name: 'Alice' });
		let result: { id: number; name: string } | null = null;

		const cleanup = $effect.root(() => {
			const { data } = useFetch<{ id: number; name: string }>(() => 'https://example.com/api');
			$effect(() => {
				result = data();
			});
		});

		await vi.waitFor(() => {
			expect(result).not.toBeNull();
		});

		expect(result).toEqual({ id: 1, name: 'Alice' });
		cleanup();
	});

	test('isFetching transitions true → false after success', async () => {
		let resolveFetch!: (value: Response) => void;
		vi.spyOn(globalThis, 'fetch').mockReturnValueOnce(
			new Promise<Response>((res) => {
				resolveFetch = res;
			})
		);

		let fetching = false;
		const cleanup = $effect.root(() => {
			const { isFetching } = useFetch<unknown>(() => 'https://example.com/api');
			$effect(() => {
				fetching = isFetching();
			});
		});

		flushSync();
		// After flushSync the fetch has been kicked off
		expect(fetching).toBe(true);

		resolveFetch(
			new Response(JSON.stringify({ ok: true }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			})
		);

		await vi.waitFor(() => {
			expect(fetching).toBe(false);
		});

		cleanup();
	});

	test('passes RequestInit to fetch', async () => {
		const fetchSpy = vi
			.spyOn(globalThis, 'fetch')
			.mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));

		const cleanup = $effect.root(() => {
			useFetch<unknown>(() => 'https://example.com/api', {
				init: { method: 'POST', headers: { Authorization: 'Bearer token' } }
			});
			flushSync();
		});

		await vi.waitFor(() => {
			expect(fetchSpy).toHaveBeenCalledWith(
				'https://example.com/api',
				expect.objectContaining({ method: 'POST' })
			);
		});

		cleanup();
	});

	// -------------------------------------------------------------------------
	// Error case
	// -------------------------------------------------------------------------

	test('sets error when fetch rejects', async () => {
		mockFetchError('Network failure');
		let capturedError: Error | null = null;

		const cleanup = $effect.root(() => {
			const { error } = useFetch<unknown>(() => 'https://example.com/api');
			$effect(() => {
				capturedError = error();
			});
		});

		await vi.waitFor(() => {
			expect(capturedError).not.toBeNull();
		});

		expect(capturedError!.message).toBe('Network failure');
		cleanup();
	});

	test('sets error when response is not ok', async () => {
		mockFetchOnce({ message: 'Not Found' }, 404);
		let capturedError: Error | null = null;

		const cleanup = $effect.root(() => {
			const { error } = useFetch<unknown>(() => 'https://example.com/api');
			$effect(() => {
				capturedError = error();
			});
		});

		await vi.waitFor(() => {
			expect(capturedError).not.toBeNull();
		});

		expect(capturedError!.message).toContain('404');
		cleanup();
	});

	test('data remains null when fetch fails', async () => {
		mockFetchError('Timeout');
		let capturedData: unknown = 'initial';

		const cleanup = $effect.root(() => {
			const { data } = useFetch<unknown>(() => 'https://example.com/api');
			$effect(() => {
				capturedData = data();
			});
		});

		await vi.waitFor(() => {
			// Wait for isFetching to settle
			expect(capturedData).toBeNull();
		});

		cleanup();
	});

	// -------------------------------------------------------------------------
	// Reactive update case
	// -------------------------------------------------------------------------

	test('re-fetches when URL changes', async () => {
		const fetchSpy = vi
			.spyOn(globalThis, 'fetch')
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ page: 1 }), {
					status: 200,
					headers: { 'Content-Type': 'application/json' }
				})
			)
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ page: 2 }), {
					status: 200,
					headers: { 'Content-Type': 'application/json' }
				})
			);

		let page = $state(1);
		let capturedData: { page: number } | null = null;

		const cleanup = $effect.root(() => {
			const { data } = useFetch<{ page: number }>(() => `https://example.com/api?page=${page}`);
			$effect(() => {
				capturedData = data();
			});
		});

		await vi.waitFor(() => {
			expect(capturedData).toEqual({ page: 1 });
		});

		page = 2;
		flushSync();

		await vi.waitFor(() => {
			expect(capturedData).toEqual({ page: 2 });
		});

		expect(fetchSpy).toHaveBeenCalledTimes(2);
		cleanup();
	});

	test('execute() triggers a fetch manually', async () => {
		mockFetchOnce({ manual: true });
		let capturedData: { manual: boolean } | null = null;

		const cleanup = $effect.root(() => {
			const { data, execute } = useFetch<{ manual: boolean }>(() => 'https://example.com/api', {
				immediate: false
			});
			$effect(() => {
				capturedData = data();
			});
			execute();
		});

		await vi.waitFor(() => {
			expect(capturedData).toEqual({ manual: true });
		});

		cleanup();
	});

	test('clears previous error on successful re-fetch', async () => {
		mockFetchError('First error');
		vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
			new Response(JSON.stringify({ ok: true }), { status: 200 })
		);

		let url = $state('https://example.com/api/1');
		let capturedError: Error | null = new Error('placeholder');

		const cleanup = $effect.root(() => {
			const { error } = useFetch<unknown>(() => url);
			$effect(() => {
				capturedError = error();
			});
		});

		// First call: error path is already set up by mockFetchError above
		// but mockFetchError was called before the effect root, so let's
		// use a fresh spy approach:
		await vi.waitFor(() => {
			expect(capturedError).not.toBeNull();
		});

		// Now mock a successful response and change URL
		vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
			new Response(JSON.stringify({ ok: true }), { status: 200 })
		);
		url = 'https://example.com/api/2';
		flushSync();

		await vi.waitFor(() => {
			expect(capturedError).toBeNull();
		});

		cleanup();
	});

	// -------------------------------------------------------------------------
	// Cleanup behavior
	// -------------------------------------------------------------------------

	test('aborts in-flight request on scope destroy', async () => {
		let abortSignal: AbortSignal | undefined = undefined;
		vi.spyOn(globalThis, 'fetch').mockImplementationOnce((_url, init) => {
			abortSignal = init?.signal ?? undefined;
			return new Promise(() => {
				// Never resolves — simulates long-running request
			});
		});

		const cleanup = $effect.root(() => {
			useFetch<unknown>(() => 'https://example.com/api');
			flushSync();
		});

		cleanup(); // destroys scope → triggers cleanup → aborts

		await vi.waitFor(() => {
			expect(abortSignal?.aborted).toBe(true);
		});
	});

	test('aborts previous request when URL changes', async () => {
		const abortSignals: (AbortSignal | undefined)[] = [];
		vi.spyOn(globalThis, 'fetch')
			.mockImplementationOnce((_url, init) => {
				abortSignals.push(init?.signal ?? undefined);
				return new Promise(() => {
					// First request never resolves
				});
			})
			.mockResolvedValueOnce(new Response(JSON.stringify({ second: true }), { status: 200 }));

		let url = $state('https://example.com/api/1');

		const cleanup = $effect.root(() => {
			useFetch<unknown>(() => url);
			flushSync();
		});

		// Change URL — should abort first request and start new one
		url = 'https://example.com/api/2';
		flushSync();

		await vi.waitFor(() => {
			expect(abortSignals[0]?.aborted).toBe(true);
		});

		cleanup();
	});

	// -------------------------------------------------------------------------
	// SSR safety
	// -------------------------------------------------------------------------

	test('does not throw when fetch is undefined (SSR)', () => {
		const originalFetch = globalThis.fetch;

		try {
			// @ts-expect-error: simulating SSR environment
			delete globalThis.fetch;

			const cleanup = $effect.root(() => {
				expect(() => {
					const { execute } = useFetch<unknown>(() => 'https://example.com/api', {
						immediate: false
					});
					execute();
				}).not.toThrow();
			});
			cleanup();
		} finally {
			globalThis.fetch = originalFetch;
		}
	});
});

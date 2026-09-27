import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useUrlSearchParams } from './useUrlSearchParams.svelte.js';

/** The URL to return to, so tests do not leak state into each other. */
let baseline: string;

beforeEach(() => {
	baseline = window.location.href;
});

afterEach(() => {
	window.history.replaceState(null, '', baseline);
	vi.restoreAllMocks();
});

/** Rewrites the query string without triggering a navigation event. */
function seedQuery(query: string) {
	window.history.replaceState(null, '', `${window.location.pathname}?${query}`);
}

function seedHash(hash: string) {
	window.history.replaceState(null, '', `${window.location.pathname}#${hash}`);
}

describe('useUrlSearchParams', () => {
	test('parses the current query string', () => {
		seedQuery('page=2&sort=name');

		const cleanup = $effect.root(() => {
			const params = useUrlSearchParams();
			// Read synchronously, before any effect runs.
			expect(params.get('page')).toBe('2');
			expect(params.get('sort')).toBe('name');
		});
		cleanup();
	});

	test('reports undefined for an absent key', () => {
		seedQuery('page=2');

		const cleanup = $effect.root(() => {
			const params = useUrlSearchParams();
			expect(params.get('missing')).toBeUndefined();
		});
		cleanup();
	});

	test('keeps a single occurrence as a bare string', () => {
		seedQuery('q=hello');

		const cleanup = $effect.root(() => {
			const params = useUrlSearchParams();
			// `?q=hello` must not force consumers to unwrap an array.
			expect(params.get('q')).toBe('hello');
		});
		cleanup();
	});

	test('collects repeated keys into an array', () => {
		seedQuery('tag=a&tag=b&tag=c');

		const cleanup = $effect.root(() => {
			const params = useUrlSearchParams();
			expect(params.get('tag')).toEqual(['a', 'b', 'c']);
		});
		cleanup();
	});

	test('fills gaps from initial without overriding the URL', () => {
		seedQuery('page=5');

		const cleanup = $effect.root(() => {
			const params = useUrlSearchParams('history', {
				initial: { page: '1', sort: 'date' }
			});

			expect(params.get('page')).toBe('5');
			expect(params.get('sort')).toBe('date');
		});
		cleanup();
	});

	test('set() writes to the URL', () => {
		seedQuery('');

		const cleanup = $effect.root(() => {
			const params = useUrlSearchParams();
			params.set('page', '3');
			flushSync();

			expect(params.get('page')).toBe('3');
			expect(window.location.search).toBe('?page=3');
		});
		cleanup();
	});

	test('serialises an array value as repeated keys', () => {
		seedQuery('');

		const cleanup = $effect.root(() => {
			const params = useUrlSearchParams();
			params.set('tag', ['x', 'y']);
			flushSync();

			expect(window.location.search).toBe('?tag=x&tag=y');
		});
		cleanup();
	});

	test('remove() drops a key', () => {
		seedQuery('a=1&b=2');

		const cleanup = $effect.root(() => {
			const params = useUrlSearchParams();
			params.remove('a');
			flushSync();

			expect(params.get('a')).toBeUndefined();
			expect(window.location.search).toBe('?b=2');
		});
		cleanup();
	});

	test('replace() swaps the whole set in one write', () => {
		seedQuery('a=1&b=2');

		const cleanup = $effect.root(() => {
			const params = useUrlSearchParams();
			params.replace({ c: '3' });
			flushSync();

			expect(params.get('a')).toBeUndefined();
			expect(params.get('c')).toBe('3');
			expect(window.location.search).toBe('?c=3');
		});
		cleanup();
	});

	test('clear() removes everything', () => {
		seedQuery('a=1&b=2');

		const cleanup = $effect.root(() => {
			const params = useUrlSearchParams();
			params.clear();
			flushSync();

			expect(params.params()).toEqual({});
			expect(window.location.search).toBe('');
		});
		cleanup();
	});

	test('drops empty values by default', () => {
		seedQuery('');

		const cleanup = $effect.root(() => {
			const params = useUrlSearchParams();
			params.set('q', '');
			flushSync();

			// `?q=` is noise in a shareable URL.
			expect(window.location.search).toBe('');
		});
		cleanup();
	});

	test('keeps empty values when asked', () => {
		seedQuery('');

		const cleanup = $effect.root(() => {
			const params = useUrlSearchParams('history', { removeEmptyValues: false });
			params.set('q', '');
			flushSync();

			expect(window.location.search).toBe('?q=');
		});
		cleanup();
	});

	test('write: false keeps parameters in memory only', () => {
		seedQuery('');

		const cleanup = $effect.root(() => {
			const params = useUrlSearchParams('history', { write: false });
			params.set('page', '9');
			flushSync();

			expect(params.get('page')).toBe('9');
			expect(window.location.search).toBe('');
		});
		cleanup();
	});

	test("write: 'push' adds a history entry", () => {
		seedQuery('');
		const push = vi.spyOn(window.history, 'pushState');

		const cleanup = $effect.root(() => {
			const params = useUrlSearchParams('history', { write: 'push' });
			params.set('page', '2');
			flushSync();

			expect(push).toHaveBeenCalledOnce();
		});
		cleanup();
	});

	test("write: 'replace' does not add a history entry", () => {
		seedQuery('');
		const push = vi.spyOn(window.history, 'pushState');
		const replace = vi.spyOn(window.history, 'replaceState');

		const cleanup = $effect.root(() => {
			const params = useUrlSearchParams();
			params.set('page', '2');
			flushSync();

			expect(push).not.toHaveBeenCalled();
			expect(replace).toHaveBeenCalled();
		});
		cleanup();
	});

	test('query() reports the serialised string', () => {
		seedQuery('a=1&b=2');

		const cleanup = $effect.root(() => {
			const params = useUrlSearchParams();
			expect(params.query()).toBe('a=1&b=2');
		});
		cleanup();
	});

	test('reacts to popstate', () => {
		seedQuery('page=1');

		const cleanup = $effect.root(() => {
			const params = useUrlSearchParams();
			flushSync();
			expect(params.get('page')).toBe('1');

			// Simulate the user pressing back.
			window.history.replaceState(null, '', `${window.location.pathname}?page=7`);
			window.dispatchEvent(new PopStateEvent('popstate'));
			flushSync();

			expect(params.get('page')).toBe('7');
		});
		cleanup();
	});

	test('a write does not feed back through the navigation listener', () => {
		// The echo guard: without it the hash modes oscillate, because
		// changing the hash fires hashchange, which reparses, which re-writes.
		seedQuery('');

		const cleanup = $effect.root(() => {
			const params = useUrlSearchParams();
			flushSync();

			params.set('page', '4');
			flushSync();

			// The listener fires for our own replaceState in some browsers;
			// either way the value must survive unchanged.
			window.dispatchEvent(new PopStateEvent('popstate'));
			flushSync();

			expect(params.get('page')).toBe('4');
			expect(window.location.search).toBe('?page=4');
		});
		cleanup();
	});

	test("hash mode reads parameters after the hash's question mark", () => {
		seedHash('/route?page=3');

		const cleanup = $effect.root(() => {
			const params = useUrlSearchParams('hash');
			expect(params.get('page')).toBe('3');
		});
		cleanup();
	});

	test('hash mode preserves the route when writing', () => {
		seedHash('/route?page=1');

		const cleanup = $effect.root(() => {
			const params = useUrlSearchParams('hash');
			params.set('page', '2');
			flushSync();

			expect(window.location.hash).toBe('#/route?page=2');
		});
		cleanup();
	});

	test('hash-params mode treats the whole hash as parameters', () => {
		seedHash('a=1&b=2');

		const cleanup = $effect.root(() => {
			const params = useUrlSearchParams('hash-params');
			expect(params.get('a')).toBe('1');

			params.set('a', '9');
			flushSync();

			expect(window.location.hash).toBe('#a=9&b=2');
		});
		cleanup();
	});

	test('hash mode reacts to hashchange', () => {
		seedHash('/route?page=1');

		const cleanup = $effect.root(() => {
			const params = useUrlSearchParams('hash');
			flushSync();

			window.history.replaceState(null, '', `${window.location.pathname}#/route?page=5`);
			window.dispatchEvent(new HashChangeEvent('hashchange'));
			flushSync();

			expect(params.get('page')).toBe('5');
		});
		cleanup();
	});

	test('debounce coalesces a burst of writes into one', async () => {
		seedQuery('');
		const replace = vi.spyOn(window.history, 'replaceState');

		const cleanup = $effect.root(() => {
			const params = useUrlSearchParams('history', { debounce: 20 });

			params.set('q', 'a');
			params.set('q', 'ab');
			params.set('q', 'abc');
			flushSync();

			// Reactive value is immediate; the URL write is deferred.
			expect(params.get('q')).toBe('abc');
			expect(replace).not.toHaveBeenCalled();
		});

		await new Promise((resolve) => setTimeout(resolve, 40));

		expect(replace).toHaveBeenCalledOnce();
		expect(window.location.search).toBe('?q=abc');

		cleanup();
	});

	test('stops reacting after the scope is destroyed', () => {
		seedQuery('page=1');

		let params!: ReturnType<typeof useUrlSearchParams>;
		const cleanup = $effect.root(() => {
			params = useUrlSearchParams();
			flushSync();
		});

		cleanup();

		window.history.replaceState(null, '', `${window.location.pathname}?page=99`);
		window.dispatchEvent(new PopStateEvent('popstate'));

		expect(params.get('page')).toBe('1');
	});
});

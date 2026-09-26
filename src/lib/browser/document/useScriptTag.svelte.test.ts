import { flushSync } from 'svelte';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { resetHeadElementRegistry } from './internal/headElement.js';
import { useScriptTag } from './useScriptTag.svelte.js';

const SRC = 'https://example.test/sdk.js';

function scriptById(id: string): HTMLScriptElement | null {
	return document.head.querySelector<HTMLScriptElement>(`script#${id}`);
}

/**
 * Scripts are never allowed to actually fetch here: `src` is assigned inside
 * `init`, so the element is stubbed before it reaches the document by
 * intercepting createElement.
 */
function stubScripts() {
	const original = document.createElement.bind(document);
	const created: HTMLScriptElement[] = [];

	const spy = vi.spyOn(document, 'createElement').mockImplementation(((
		tag: string,
		options?: ElementCreationOptions
	) => {
		const element = original(tag, options);
		if (tag !== 'script') return element;

		const script = element as HTMLScriptElement;
		// Swallow the assignment so no network request is made.
		Object.defineProperty(script, 'src', {
			configurable: true,
			get: () => SRC,
			set: () => {}
		});
		created.push(script);
		return script;
	}) as typeof document.createElement);

	return {
		created,
		restore: () => spy.mockRestore()
	};
}

afterEach(() => {
	resetHeadElementRegistry();
	for (const element of document.head.querySelectorAll('script[id^="svelte-use-script"]')) {
		element.remove();
	}
	vi.restoreAllMocks();
});

describe('useScriptTag', () => {
	test('appends a script and reports loading', () => {
		const stub = stubScripts();

		const cleanup = $effect.root(() => {
			const script = useScriptTag(SRC, { id: 'svelte-use-script-a' });
			flushSync();

			expect(scriptById('svelte-use-script-a')).not.toBeNull();
			expect(script.status()).toBe('loading');
			expect(script.isLoading()).toBe(true);
			expect(script.isLoaded()).toBe(false);
		});

		cleanup();
		stub.restore();
	});

	test('applies the configured attributes', () => {
		const stub = stubScripts();

		const cleanup = $effect.root(() => {
			useScriptTag(SRC, {
				id: 'svelte-use-script-b',
				async: false,
				defer: true,
				type: 'module',
				crossOrigin: 'anonymous',
				integrity: 'sha384-abc'
			});
			flushSync();

			const element = scriptById('svelte-use-script-b');
			expect(element?.async).toBe(false);
			expect(element?.defer).toBe(true);
			expect(element?.type).toBe('module');
			expect(element?.crossOrigin).toBe('anonymous');
			expect(element?.integrity).toBe('sha384-abc');
		});

		cleanup();
		stub.restore();
	});

	test('resolves and reports loaded once the load event fires', async () => {
		const stub = stubScripts();
		let script!: ReturnType<typeof useScriptTag>;

		const cleanup = $effect.root(() => {
			script = useScriptTag(SRC, { id: 'svelte-use-script-c' });
			flushSync();
		});

		const promise = script.load();
		stub.created[0].dispatchEvent(new Event('load'));
		await promise;
		flushSync();

		expect(script.status()).toBe('loaded');
		expect(script.isLoaded()).toBe(true);
		expect(script.error()).toBeNull();

		cleanup();
		stub.restore();
	});

	test('reports the error event when loading fails', async () => {
		const stub = stubScripts();
		let script!: ReturnType<typeof useScriptTag>;

		const cleanup = $effect.root(() => {
			script = useScriptTag(SRC, { id: 'svelte-use-script-d' });
			flushSync();
		});

		const promise = script.load();
		stub.created[0].dispatchEvent(new Event('error'));
		await expect(promise).rejects.toBeInstanceOf(Event);
		flushSync();

		expect(script.status()).toBe('error');
		expect(script.error()).not.toBeNull();

		cleanup();
		stub.restore();
	});

	test('calls onLoaded and onError', async () => {
		const stub = stubScripts();
		const onLoaded = vi.fn();

		let script!: ReturnType<typeof useScriptTag>;
		const cleanup = $effect.root(() => {
			script = useScriptTag(SRC, { id: 'svelte-use-script-e', onLoaded });
			flushSync();
		});

		const promise = script.load();
		stub.created[0].dispatchEvent(new Event('load'));
		await promise;

		expect(onLoaded).toHaveBeenCalledOnce();

		cleanup();
		stub.restore();
	});

	test('repeat load() calls return the same promise', () => {
		const stub = stubScripts();

		const cleanup = $effect.root(() => {
			const script = useScriptTag(SRC, { id: 'svelte-use-script-f' });
			flushSync();

			expect(script.load()).toBe(script.load());
		});

		cleanup();
		stub.restore();
	});

	test('two call sites share one element and one promise', () => {
		const stub = stubScripts();

		const cleanup = $effect.root(() => {
			const first = useScriptTag(SRC, { id: 'svelte-use-script-g' });
			const second = useScriptTag(SRC, { id: 'svelte-use-script-g' });
			flushSync();

			expect(document.head.querySelectorAll('script#svelte-use-script-g')).toHaveLength(1);
			// The second consumer must settle from the first's promise, not from
			// a listener attached after the event may already have fired.
			expect(first.load()).toBe(second.load());
		});

		cleanup();
		stub.restore();
	});

	test('a second consumer of an already-loaded script resolves immediately', async () => {
		const stub = stubScripts();

		const first = $effect.root(() => {
			useScriptTag(SRC, { id: 'svelte-use-script-h' });
			flushSync();
		});

		stub.created[0].dispatchEvent(new Event('load'));

		let second!: ReturnType<typeof useScriptTag>;
		const secondScope = $effect.root(() => {
			second = useScriptTag(SRC, { id: 'svelte-use-script-h' });
			flushSync();
		});

		await expect(second.load()).resolves.toBeInstanceOf(HTMLScriptElement);

		first();
		secondScope();
		stub.restore();
	});

	test('adopts an already-stamped tag and resolves without an event', async () => {
		// The case that hangs without the data attribute: a tag written into
		// app.html whose load event fired long before this composable existed.
		const existing = document.createElement('script');
		existing.id = 'svelte-use-script-i';
		existing.setAttribute('data-svelte-use-loaded', '');
		document.head.appendChild(existing);

		let script!: ReturnType<typeof useScriptTag>;
		const cleanup = $effect.root(() => {
			script = useScriptTag(SRC, { id: 'svelte-use-script-i' });
			flushSync();
		});

		await expect(script.load()).resolves.toBe(existing);

		cleanup();
		// Adopted, so it must still be there.
		expect(scriptById('svelte-use-script-i')).not.toBeNull();
		existing.remove();
	});

	test('keeps the element on destroy by default', () => {
		const stub = stubScripts();

		const cleanup = $effect.root(() => {
			useScriptTag(SRC, { id: 'svelte-use-script-j' });
			flushSync();
		});

		cleanup();

		// Removing a script does not undo its side effects, so the default is
		// deliberately the opposite of useStyleTag.
		expect(scriptById('svelte-use-script-j')).not.toBeNull();
		scriptById('svelte-use-script-j')?.remove();
		stub.restore();
	});

	test('removes the element when removeOnDestroy is true', () => {
		const stub = stubScripts();

		const cleanup = $effect.root(() => {
			useScriptTag(SRC, { id: 'svelte-use-script-k', removeOnDestroy: true });
			flushSync();
		});

		cleanup();

		expect(scriptById('svelte-use-script-k')).toBeNull();
		stub.restore();
	});

	test('immediate: false defers injection until load()', () => {
		const stub = stubScripts();

		const cleanup = $effect.root(() => {
			const script = useScriptTag(SRC, { id: 'svelte-use-script-l', immediate: false });
			flushSync();

			expect(scriptById('svelte-use-script-l')).toBeNull();
			expect(script.status()).toBe('idle');

			script.load();
			expect(scriptById('svelte-use-script-l')).not.toBeNull();
		});

		cleanup();
		scriptById('svelte-use-script-l')?.remove();
		stub.restore();
	});

	test('derives a stable id from the src', () => {
		const stub = stubScripts();

		const cleanup = $effect.root(() => {
			const a = useScriptTag(SRC, { immediate: false });
			const b = useScriptTag(SRC, { immediate: false });
			flushSync();

			expect(a.id).toBe(b.id);
			expect(a.id).toMatch(/^svelte-use-script-[a-z0-9]+$/);
		});

		cleanup();
		stub.restore();
	});
});

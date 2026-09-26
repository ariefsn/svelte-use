import { flushSync } from 'svelte';
import { afterEach, describe, expect, test } from 'vitest';
import { resetHeadElementRegistry } from './internal/headElement.js';
import { useStyleTag } from './useStyleTag.svelte.js';

function styleById(id: string): HTMLStyleElement | null {
	return document.head.querySelector<HTMLStyleElement>(`style#${id}`);
}

afterEach(() => {
	resetHeadElementRegistry();
	for (const element of document.head.querySelectorAll(
		'style[id^="svelte-use-style"], style#shared'
	)) {
		element.remove();
	}
});

describe('useStyleTag', () => {
	test('injects a style element carrying the CSS', () => {
		const cleanup = $effect.root(() => {
			const tag = useStyleTag('.a { color: red; }', { id: 'svelte-use-style-a' });
			flushSync();

			expect(styleById('svelte-use-style-a')?.textContent).toBe('.a { color: red; }');
			expect(tag.css()).toBe('.a { color: red; }');
			expect(tag.isLoaded()).toBe(true);
		});
		cleanup();
	});

	test('reports the CSS before any effect runs', () => {
		const cleanup = $effect.root(() => {
			// No flushSync: the SSR-equivalent read.
			const tag = useStyleTag('.b { color: blue; }', { id: 'svelte-use-style-b' });
			expect(tag.css()).toBe('.b { color: blue; }');
		});
		cleanup();
	});

	test('applies the media attribute', () => {
		const cleanup = $effect.root(() => {
			useStyleTag('.c {}', { id: 'svelte-use-style-c', media: 'print' });
			flushSync();

			expect(styleById('svelte-use-style-c')?.media).toBe('print');
		});
		cleanup();
	});

	test('re-applies reactive CSS without recreating the element', () => {
		const cleanup = $effect.root(() => {
			let hue = $state(0);
			useStyleTag(() => `.d { color: hsl(${hue} 50% 50%); }`, { id: 'svelte-use-style-d' });
			flushSync();

			const first = styleById('svelte-use-style-d');
			expect(first?.textContent).toContain('hsl(0');

			hue = 120;
			flushSync();

			expect(styleById('svelte-use-style-d')).toBe(first);
			expect(first?.textContent).toContain('hsl(120');
		});
		cleanup();
	});

	test('set() overrides the applied CSS', () => {
		const cleanup = $effect.root(() => {
			const tag = useStyleTag('.e { color: red; }', { id: 'svelte-use-style-e' });
			flushSync();

			tag.set('.e { color: lime; }');
			flushSync();

			expect(tag.css()).toBe('.e { color: lime; }');
			expect(styleById('svelte-use-style-e')?.textContent).toBe('.e { color: lime; }');
		});
		cleanup();
	});

	test('a reactive source wins over a previous set()', () => {
		const cleanup = $effect.root(() => {
			let size = $state(1);
			const tag = useStyleTag(() => `.f { font-size: ${size}rem; }`, { id: 'svelte-use-style-f' });
			flushSync();

			tag.set('.f { font-size: 99rem; }');
			flushSync();
			expect(tag.css()).toBe('.f { font-size: 99rem; }');

			size = 2;
			flushSync();
			expect(tag.css()).toBe('.f { font-size: 2rem; }');
		});
		cleanup();
	});

	test('removes the element on scope destroy', () => {
		const cleanup = $effect.root(() => {
			useStyleTag('.g {}', { id: 'svelte-use-style-g' });
			flushSync();
			expect(styleById('svelte-use-style-g')).not.toBeNull();
		});

		cleanup();

		expect(styleById('svelte-use-style-g')).toBeNull();
	});

	test('keeps the element when removeOnDestroy is false', () => {
		const cleanup = $effect.root(() => {
			useStyleTag('.h {}', { id: 'svelte-use-style-h', removeOnDestroy: false });
			flushSync();
		});

		cleanup();

		expect(styleById('svelte-use-style-h')).not.toBeNull();
		styleById('svelte-use-style-h')?.remove();
	});

	test('two call sites sharing an id share one element', () => {
		const cleanup = $effect.root(() => {
			useStyleTag('.i {}', { id: 'shared' });
			useStyleTag('.i {}', { id: 'shared' });
			flushSync();

			expect(document.head.querySelectorAll('style#shared')).toHaveLength(1);
		});
		cleanup();
	});

	test('a shared element survives until every consumer releases it', () => {
		// The invariant that stops one component tearing down CSS another needs.
		const first = $effect.root(() => {
			useStyleTag('.j {}', { id: 'shared' });
			flushSync();
		});

		const second = $effect.root(() => {
			useStyleTag('.j {}', { id: 'shared' });
			flushSync();
		});

		first();
		expect(document.head.querySelector('style#shared')).not.toBeNull();

		second();
		expect(document.head.querySelector('style#shared')).toBeNull();
	});

	test('immediate: false defers injection until load()', () => {
		const cleanup = $effect.root(() => {
			const tag = useStyleTag('.k {}', { id: 'svelte-use-style-k', immediate: false });
			flushSync();

			expect(styleById('svelte-use-style-k')).toBeNull();
			expect(tag.isLoaded()).toBe(false);

			tag.load();
			expect(styleById('svelte-use-style-k')).not.toBeNull();
			expect(tag.isLoaded()).toBe(true);
		});
		cleanup();
	});

	test('unload() is idempotent and safe before teardown', () => {
		const cleanup = $effect.root(() => {
			const tag = useStyleTag('.l {}', { id: 'svelte-use-style-l' });
			flushSync();

			tag.unload();
			tag.unload();

			expect(styleById('svelte-use-style-l')).toBeNull();
			expect(tag.isLoaded()).toBe(false);
		});

		// The destroy effect also releases; the refcount must not go negative.
		expect(() => cleanup()).not.toThrow();
	});

	test('generates a distinct id when none is given', () => {
		const cleanup = $effect.root(() => {
			const a = useStyleTag('.m {}');
			const b = useStyleTag('.n {}');
			flushSync();

			expect(a.id).not.toBe(b.id);
			expect(a.id).toMatch(/^svelte-use-style-\d+$/);
		});
		cleanup();
	});
});

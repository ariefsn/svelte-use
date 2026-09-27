import { afterEach, describe, expect, test } from 'vitest';
import { flushSync } from 'svelte';
import { useTextDirection } from './useTextDirection.svelte.js';

/** MutationObserver delivers on a microtask, so the assertion has to wait a turn. */
const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

describe('useTextDirection', () => {
	afterEach(() => {
		document.documentElement.setAttribute('dir', 'ltr');
	});

	test('defaults to ltr', () => {
		const cleanup = $effect.root(() => {
			const { current } = useTextDirection();
			expect(current()).toBe('ltr');
		});
		cleanup();
	});

	test('set changes direction and writes the attribute', () => {
		const cleanup = $effect.root(() => {
			const { current, set } = useTextDirection();
			set('rtl');
			expect(current()).toBe('rtl');
			expect(document.documentElement.getAttribute('dir')).toBe('rtl');
		});
		cleanup();
	});

	test('accepts initial direction', () => {
		const cleanup = $effect.root(() => {
			const el = document.createElement('div');
			const { current } = useTextDirection({ element: el, initial: 'rtl' });
			expect(current()).toBe('rtl');
		});
		cleanup();
	});

	test("prefers the element's existing dir attribute over initial", () => {
		const el = document.createElement('div');
		el.setAttribute('dir', 'rtl');
		const cleanup = $effect.root(() => {
			const { current } = useTextDirection({ element: el, initial: 'ltr' });
			expect(current()).toBe('rtl');
		});
		cleanup();
	});

	test('picks up a dir attribute changed by someone else', async () => {
		const el = document.createElement('div');
		document.body.appendChild(el);
		let api!: ReturnType<typeof useTextDirection>;
		const cleanup = $effect.root(() => {
			api = useTextDirection({ element: el });
		});
		flushSync();

		el.setAttribute('dir', 'rtl');
		await settle();
		flushSync();
		expect(api.current()).toBe('rtl');

		cleanup();
		el.remove();
	});

	test('a write matching the current value does not change state', async () => {
		const el = document.createElement('div');
		document.body.appendChild(el);
		let api!: ReturnType<typeof useTextDirection>;
		const cleanup = $effect.root(() => {
			api = useTextDirection({ element: el, initial: 'ltr' });
		});
		flushSync();

		el.setAttribute('dir', 'ltr');
		await settle();
		flushSync();
		expect(api.current()).toBe('ltr');

		cleanup();
		el.remove();
	});

	test('removing the attribute leaves the last known direction', async () => {
		const el = document.createElement('div');
		el.setAttribute('dir', 'rtl');
		document.body.appendChild(el);
		let api!: ReturnType<typeof useTextDirection>;
		const cleanup = $effect.root(() => {
			api = useTextDirection({ element: el });
		});
		flushSync();

		el.removeAttribute('dir');
		await settle();
		flushSync();
		expect(api.current()).toBe('rtl');

		cleanup();
		el.remove();
	});

	test('stops observing once the scope is destroyed', async () => {
		const el = document.createElement('div');
		document.body.appendChild(el);
		let api!: ReturnType<typeof useTextDirection>;
		const cleanup = $effect.root(() => {
			api = useTextDirection({ element: el });
		});
		flushSync();
		cleanup();

		el.setAttribute('dir', 'rtl');
		await settle();
		expect(api.current()).toBe('ltr');

		el.remove();
	});
});

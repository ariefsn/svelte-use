import { flushSync } from 'svelte';
import { describe, expect, test, vi } from 'vitest';
import { useBrowserLocation } from './useBrowserLocation.svelte.js';

describe('useBrowserLocation', () => {
	test('returns current href', () => {
		const cleanup = $effect.root(() => {
			const { href } = useBrowserLocation();
			expect(href()).toBe(window.location.href);
		});
		cleanup();
	});

	test('returns current pathname', () => {
		const cleanup = $effect.root(() => {
			const { pathname } = useBrowserLocation();
			expect(pathname()).toBe(window.location.pathname);
		});
		cleanup();
	});

	test('returns current search', () => {
		const cleanup = $effect.root(() => {
			const { search } = useBrowserLocation();
			expect(search()).toBe(window.location.search);
		});
		cleanup();
	});

	test('returns current hash', () => {
		const cleanup = $effect.root(() => {
			const { hash } = useBrowserLocation();
			expect(hash()).toBe(window.location.hash);
		});
		cleanup();
	});

	test('updates on popstate event', () => {
		const cleanup = $effect.root(() => {
			const { href, pathname } = useBrowserLocation();
			flushSync();

			const initialHref = href();

			// pushState then dispatch popstate
			window.history.pushState({}, '', '/new-path');
			window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
			flushSync();

			expect(pathname()).toBe('/new-path');
			expect(href()).not.toBe(initialHref);

			// Restore
			window.history.pushState({}, '', '/');
		});
		cleanup();
	});

	test('updates on hashchange event', () => {
		const cleanup = $effect.root(() => {
			const { hash } = useBrowserLocation();
			flushSync();

			// Navigate to a hash using pushState, then fire hashchange
			window.history.pushState({}, '', '/#section-two');
			window.dispatchEvent(new HashChangeEvent('hashchange'));
			flushSync();

			expect(hash()).toBe('#section-two');

			// Restore
			window.history.pushState({}, '', '/');
		});
		cleanup();
	});

	test('cleanup removes event listeners', () => {
		const addSpy = vi.spyOn(window, 'addEventListener');
		const removeSpy = vi.spyOn(window, 'removeEventListener');

		const cleanup = $effect.root(() => {
			useBrowserLocation();
			flushSync();
		});

		cleanup();
		flushSync();

		expect(addSpy).toHaveBeenCalledWith('popstate', expect.any(Function));
		expect(addSpy).toHaveBeenCalledWith('hashchange', expect.any(Function));
		expect(removeSpy).toHaveBeenCalledWith('popstate', expect.any(Function));
		expect(removeSpy).toHaveBeenCalledWith('hashchange', expect.any(Function));

		addSpy.mockRestore();
		removeSpy.mockRestore();
	});

	test('all getters return string values', () => {
		const cleanup = $effect.root(() => {
			const { href, pathname, search, hash } = useBrowserLocation();
			expect(typeof href()).toBe('string');
			expect(typeof pathname()).toBe('string');
			expect(typeof search()).toBe('string');
			expect(typeof hash()).toBe('string');
		});
		cleanup();
	});

	test('multiple instances share location state independently', () => {
		const cleanup = $effect.root(() => {
			const a = useBrowserLocation();
			const b = useBrowserLocation();
			flushSync();

			expect(a.pathname()).toBe(b.pathname());

			window.history.pushState({}, '', '/shared');
			window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
			flushSync();

			expect(a.pathname()).toBe('/shared');
			expect(b.pathname()).toBe('/shared');

			// Restore
			window.history.pushState({}, '', '/');
		});
		cleanup();
	});
});

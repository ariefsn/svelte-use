import { flushSync } from 'svelte';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useOnline } from './useOnline.svelte.js';

describe('useOnline', () => {
	beforeEach(() => {
		// Restore navigator.onLine to true before each test
		Object.defineProperty(navigator, 'onLine', { value: true, writable: true, configurable: true });
	});

	test('returns true when navigator.onLine is true', () => {
		Object.defineProperty(navigator, 'onLine', { value: true, writable: true, configurable: true });
		const cleanup = $effect.root(() => {
			const isOnline = useOnline();
			expect(isOnline()).toBe(true);
		});
		cleanup();
	});

	test('returns false when navigator.onLine is false', () => {
		Object.defineProperty(navigator, 'onLine', { value: false, writable: true, configurable: true });
		const cleanup = $effect.root(() => {
			const isOnline = useOnline();
			expect(isOnline()).toBe(false);
		});
		cleanup();
	});

	test('updates to false when offline event fires', () => {
		Object.defineProperty(navigator, 'onLine', { value: true, writable: true, configurable: true });
		const cleanup = $effect.root(() => {
			const isOnline = useOnline();
			flushSync();

			window.dispatchEvent(new Event('offline'));
			flushSync();

			expect(isOnline()).toBe(false);
		});
		cleanup();
	});

	test('updates to true when online event fires', () => {
		Object.defineProperty(navigator, 'onLine', { value: false, writable: true, configurable: true });
		const cleanup = $effect.root(() => {
			const isOnline = useOnline();
			flushSync();

			window.dispatchEvent(new Event('online'));
			flushSync();

			expect(isOnline()).toBe(true);
		});
		cleanup();
	});

	test('toggles correctly with multiple events', () => {
		const cleanup = $effect.root(() => {
			const isOnline = useOnline();
			flushSync();

			window.dispatchEvent(new Event('offline'));
			flushSync();
			expect(isOnline()).toBe(false);

			window.dispatchEvent(new Event('online'));
			flushSync();
			expect(isOnline()).toBe(true);

			window.dispatchEvent(new Event('offline'));
			flushSync();
			expect(isOnline()).toBe(false);
		});
		cleanup();
	});

	test('cleanup removes event listeners', () => {
		const addSpy = vi.spyOn(window, 'addEventListener');
		const removeSpy = vi.spyOn(window, 'removeEventListener');

		const cleanup = $effect.root(() => {
			useOnline();
			flushSync();
		});

		cleanup();
		flushSync();

		const addedOnline = addSpy.mock.calls.some(([event]) => event === 'online');
		const addedOffline = addSpy.mock.calls.some(([event]) => event === 'offline');
		const removedOnline = removeSpy.mock.calls.some(([event]) => event === 'online');
		const removedOffline = removeSpy.mock.calls.some(([event]) => event === 'offline');

		expect(addedOnline).toBe(true);
		expect(addedOffline).toBe(true);
		expect(removedOnline).toBe(true);
		expect(removedOffline).toBe(true);

		addSpy.mockRestore();
		removeSpy.mockRestore();
	});

	test('does not react to unrelated window events', () => {
		Object.defineProperty(navigator, 'onLine', { value: true, writable: true, configurable: true });
		const cleanup = $effect.root(() => {
			const isOnline = useOnline();
			flushSync();

			window.dispatchEvent(new Event('resize'));
			flushSync();

			expect(isOnline()).toBe(true);
		});
		cleanup();
	});
});

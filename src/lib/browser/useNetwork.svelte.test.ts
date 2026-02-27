import { flushSync } from 'svelte';
import { describe, expect, test, vi } from 'vitest';
import { useNetwork } from './useNetwork.svelte.js';

describe('useNetwork', () => {
	test('online reflects navigator.onLine initial value', () => {
		const cleanup = $effect.root(() => {
			const { online } = useNetwork();
			// In jsdom, navigator.onLine defaults to true
			expect(online()).toBe(navigator.onLine);
		});
		cleanup();
	});

	test('online becomes false when offline event fires', () => {
		const cleanup = $effect.root(() => {
			const { online } = useNetwork();
			flushSync();

			window.dispatchEvent(new Event('offline'));
			flushSync();

			expect(online()).toBe(false);
		});
		cleanup();
	});

	test('online becomes true when online event fires', () => {
		const cleanup = $effect.root(() => {
			const { online } = useNetwork();
			flushSync();

			// Go offline first
			window.dispatchEvent(new Event('offline'));
			flushSync();
			expect(online()).toBe(false);

			// Come back online
			window.dispatchEvent(new Event('online'));
			flushSync();
			expect(online()).toBe(true);
		});
		cleanup();
	});

	test('cleanup removes event listeners', () => {
		const addSpy = vi.spyOn(window, 'addEventListener');
		const removeSpy = vi.spyOn(window, 'removeEventListener');

		const cleanup = $effect.root(() => {
			useNetwork();
			flushSync();
		});

		cleanup();
		flushSync();

		expect(addSpy.mock.calls.some(([e]) => e === 'online')).toBe(true);
		expect(removeSpy.mock.calls.some(([e]) => e === 'online')).toBe(true);
		expect(addSpy.mock.calls.some(([e]) => e === 'offline')).toBe(true);
		expect(removeSpy.mock.calls.some(([e]) => e === 'offline')).toBe(true);

		addSpy.mockRestore();
		removeSpy.mockRestore();
	});

	test('does not update after cleanup', () => {
		let capturedOnline: boolean | undefined;

		const cleanup = $effect.root(() => {
			const { online } = useNetwork();
			flushSync();
			capturedOnline = online();
		});

		cleanup();
		flushSync();

		// Dispatch event after cleanup – should not affect captured value
		window.dispatchEvent(new Event('offline'));
		flushSync();

		expect(capturedOnline).toBe(true);
	});
});

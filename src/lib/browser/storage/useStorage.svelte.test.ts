import { flushSync } from 'svelte';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useStorage } from './useStorage.svelte.js';

beforeEach(() => {
	localStorage.clear();
	sessionStorage.clear();
});

describe('useStorage', () => {
	test('defaults to localStorage', () => {
		const cleanup = $effect.root(() => {
			const store = useStorage('k', 'initial');
			store.set('written');
			flushSync();
		});

		expect(localStorage.getItem('k')).toBe('"written"');
		expect(sessionStorage.getItem('k')).toBeNull();
		cleanup();
	});

	test("writes to sessionStorage when area is 'session'", () => {
		const cleanup = $effect.root(() => {
			const store = useStorage('k', 'initial', 'session');
			store.set('written');
			flushSync();
		});

		expect(sessionStorage.getItem('k')).toBe('"written"');
		expect(localStorage.getItem('k')).toBeNull();
		cleanup();
	});

	test('reads an existing value on init', () => {
		localStorage.setItem('k', '"existing"');

		const cleanup = $effect.root(() => {
			const store = useStorage('k', 'fallback');
			expect(store.value).toBe('existing');
		});
		cleanup();
	});

	test('falls back to initial when the key is absent', () => {
		const cleanup = $effect.root(() => {
			const store = useStorage('missing', 'fallback');
			expect(store.value).toBe('fallback');
		});
		cleanup();
	});

	test('falls back to initial when stored JSON is malformed', () => {
		localStorage.setItem('k', '{not json');

		const cleanup = $effect.root(() => {
			const store = useStorage('k', 'fallback');
			expect(store.value).toBe('fallback');
		});
		cleanup();
	});

	test('round-trips objects', () => {
		const cleanup = $effect.root(() => {
			const store = useStorage('obj', { a: 1 });
			store.set({ a: 42 });
			flushSync();
			expect(store.value).toEqual({ a: 42 });
		});

		expect(JSON.parse(localStorage.getItem('obj')!)).toEqual({ a: 42 });
		cleanup();
	});

	test('remove() clears the key and resets to initial', () => {
		const cleanup = $effect.root(() => {
			const store = useStorage('k', 'initial');
			store.set('written');
			flushSync();
			expect(localStorage.getItem('k')).toBe('"written"');

			store.remove();
			flushSync();

			expect(store.value).toBe('initial');
			// The write-back effect must not resurrect the key.
			expect(localStorage.getItem('k')).toBeNull();
		});
		cleanup();
	});

	test('set() after remove() persists again', () => {
		const cleanup = $effect.root(() => {
			const store = useStorage('k', 'initial');
			store.remove();
			flushSync();

			store.set('again');
			flushSync();

			expect(localStorage.getItem('k')).toBe('"again"');
		});
		cleanup();
	});

	test('honours custom serializer and deserializer', () => {
		const iso = '2026-01-02T03:04:05.000Z';
		localStorage.setItem('when', iso);

		const cleanup = $effect.root(() => {
			const store = useStorage('when', new Date(0), 'local', {
				serializer: (d: Date) => d.toISOString(),
				deserializer: (raw: string) => new Date(raw)
			});

			expect(store.value.toISOString()).toBe(iso);

			store.set(new Date('2027-01-01T00:00:00.000Z'));
			flushSync();
		});

		expect(localStorage.getItem('when')).toBe('2027-01-01T00:00:00.000Z');
		cleanup();
	});

	test('syncs from a storage event in another tab', () => {
		const cleanup = $effect.root(() => {
			const store = useStorage('k', 'initial');
			flushSync();

			window.dispatchEvent(
				new StorageEvent('storage', {
					key: 'k',
					newValue: '"from-other-tab"',
					storageArea: localStorage
				})
			);
			flushSync();

			expect(store.value).toBe('from-other-tab');
		});
		cleanup();
	});

	test('resets to initial when another tab removes the key', () => {
		const cleanup = $effect.root(() => {
			const store = useStorage('k', 'initial');
			store.set('written');
			flushSync();

			window.dispatchEvent(
				new StorageEvent('storage', { key: 'k', newValue: null, storageArea: localStorage })
			);
			flushSync();

			expect(store.value).toBe('initial');
		});
		cleanup();
	});

	test('ignores storage events for other keys and other areas', () => {
		const cleanup = $effect.root(() => {
			const store = useStorage('k', 'initial');
			store.set('mine');
			flushSync();

			window.dispatchEvent(
				new StorageEvent('storage', {
					key: 'other',
					newValue: '"theirs"',
					storageArea: localStorage
				})
			);
			window.dispatchEvent(
				new StorageEvent('storage', {
					key: 'k',
					newValue: '"wrong-area"',
					storageArea: sessionStorage
				})
			);
			flushSync();

			expect(store.value).toBe('mine');
		});
		cleanup();
	});

	test('keeps the reactive value when persisting throws', () => {
		const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
			throw new DOMException('QuotaExceededError');
		});

		const cleanup = $effect.root(() => {
			const store = useStorage('k', 'initial');
			store.set('too-big');
			flushSync();

			expect(store.value).toBe('too-big');
		});

		cleanup();
		spy.mockRestore();
	});

	test('removes the storage listener on scope destroy', () => {
		let store!: ReturnType<typeof useStorage<string>>;
		const cleanup = $effect.root(() => {
			store = useStorage('k', 'initial');
			flushSync();
		});

		cleanup();

		window.dispatchEvent(
			new StorageEvent('storage', {
				key: 'k',
				newValue: '"after-destroy"',
				storageArea: localStorage
			})
		);

		expect(store.value).toBe('initial');
	});
});

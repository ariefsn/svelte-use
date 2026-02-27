import { flushSync } from 'svelte';
import { describe, expect, test, vi } from 'vitest';
import { useObjectUrl } from './useObjectUrl.svelte.js';

describe('useObjectUrl', () => {
	test('returns undefined when source is undefined', () => {
		const cleanup = $effect.root(() => {
			const url = useObjectUrl(() => undefined);
			flushSync();
			expect(url()).toBeUndefined();
		});
		cleanup();
	});

	test('returns a blob URL when given a Blob', () => {
		const cleanup = $effect.root(() => {
			const blob = new Blob(['hello'], { type: 'text/plain' });
			const url = useObjectUrl(() => blob);
			flushSync();
			expect(url()).toMatch(/^blob:/);
		});
		cleanup();
	});

	test('returns a blob URL when given a File', () => {
		const cleanup = $effect.root(() => {
			const file = new File(['content'], 'test.txt', { type: 'text/plain' });
			const url = useObjectUrl(() => file);
			flushSync();
			expect(url()).toMatch(/^blob:/);
		});
		cleanup();
	});

	test('revokes the old URL and creates a new one when source changes', () => {
		const revokeSpy = vi.spyOn(URL, 'revokeObjectURL');

		let source = $state<Blob | undefined>(new Blob(['first']));
		let firstUrl: string | undefined;

		const cleanup = $effect.root(() => {
			const url = useObjectUrl(() => source);
			flushSync();
			firstUrl = url();

			source = new Blob(['second']);
			flushSync();

			expect(url()).toMatch(/^blob:/);
			expect(url()).not.toBe(firstUrl);
			expect(revokeSpy).toHaveBeenCalledWith(firstUrl);
		});

		cleanup();
		revokeSpy.mockRestore();
	});

	test('revokes the URL when source becomes undefined', () => {
		const revokeSpy = vi.spyOn(URL, 'revokeObjectURL');

		let source = $state<Blob | undefined>(new Blob(['data']));
		let createdUrl: string | undefined;

		const cleanup = $effect.root(() => {
			const url = useObjectUrl(() => source);
			flushSync();
			createdUrl = url();
			expect(createdUrl).toMatch(/^blob:/);

			source = undefined;
			flushSync();

			expect(url()).toBeUndefined();
			expect(revokeSpy).toHaveBeenCalledWith(createdUrl);
		});

		cleanup();
		revokeSpy.mockRestore();
	});

	test('revokes the URL on cleanup', () => {
		const revokeSpy = vi.spyOn(URL, 'revokeObjectURL');
		let createdUrl: string | undefined;

		const cleanup = $effect.root(() => {
			const blob = new Blob(['cleanup-test']);
			const url = useObjectUrl(() => blob);
			flushSync();
			createdUrl = url();
			expect(createdUrl).toMatch(/^blob:/);
		});

		cleanup();
		expect(revokeSpy).toHaveBeenCalledWith(createdUrl);
		revokeSpy.mockRestore();
	});

	test('URL.createObjectURL is called once per unique source', () => {
		const createSpy = vi.spyOn(URL, 'createObjectURL');

		const blob = new Blob(['once']);
		const cleanup = $effect.root(() => {
			useObjectUrl(() => blob);
			flushSync();
		});

		expect(createSpy).toHaveBeenCalledTimes(1);
		cleanup();
		createSpy.mockRestore();
	});

	test('two independent instances produce separate URLs', () => {
		const cleanup = $effect.root(() => {
			const blobA = new Blob(['A']);
			const blobB = new Blob(['B']);

			const urlA = useObjectUrl(() => blobA);
			const urlB = useObjectUrl(() => blobB);
			flushSync();

			expect(urlA()).toMatch(/^blob:/);
			expect(urlB()).toMatch(/^blob:/);
			expect(urlA()).not.toBe(urlB());
		});
		cleanup();
	});
});

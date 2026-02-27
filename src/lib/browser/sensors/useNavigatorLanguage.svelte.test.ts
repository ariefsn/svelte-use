import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useNavigatorLanguage } from './useNavigatorLanguage.svelte.js';

describe('useNavigatorLanguage', () => {
	let originalLanguage: string;

	beforeEach(() => {
		originalLanguage = navigator.language;
	});

	afterEach(() => {
		Object.defineProperty(navigator, 'language', {
			value: originalLanguage,
			writable: true,
			configurable: true
		});
	});

	test('returns the current navigator.language', () => {
		Object.defineProperty(navigator, 'language', {
			value: 'en-US',
			writable: true,
			configurable: true
		});

		const cleanup = $effect.root(() => {
			const language = useNavigatorLanguage();
			expect(language()).toBe('en-US');
		});
		cleanup();
	});

	test('updates reactively when languagechange event fires', () => {
		Object.defineProperty(navigator, 'language', {
			value: 'en-US',
			writable: true,
			configurable: true
		});

		const cleanup = $effect.root(() => {
			const language = useNavigatorLanguage();
			flushSync();

			expect(language()).toBe('en-US');

			Object.defineProperty(navigator, 'language', {
				value: 'fr-FR',
				writable: true,
				configurable: true
			});

			window.dispatchEvent(new Event('languagechange'));
			flushSync();

			expect(language()).toBe('fr-FR');
		});
		cleanup();
	});

	test('cleanup removes languagechange listener', () => {
		const addSpy = vi.spyOn(window, 'addEventListener');
		const removeSpy = vi.spyOn(window, 'removeEventListener');

		const cleanup = $effect.root(() => {
			useNavigatorLanguage();
			flushSync();
		});

		cleanup();
		flushSync();

		expect(addSpy).toHaveBeenCalledWith('languagechange', expect.any(Function));
		expect(removeSpy).toHaveBeenCalledWith('languagechange', expect.any(Function));

		addSpy.mockRestore();
		removeSpy.mockRestore();
	});

	test('handles multiple language changes', () => {
		Object.defineProperty(navigator, 'language', {
			value: 'en',
			writable: true,
			configurable: true
		});

		const cleanup = $effect.root(() => {
			const language = useNavigatorLanguage();
			flushSync();

			const languages = ['de-DE', 'ja-JP', 'zh-CN'];
			for (const lang of languages) {
				Object.defineProperty(navigator, 'language', {
					value: lang,
					writable: true,
					configurable: true
				});
				window.dispatchEvent(new Event('languagechange'));
				flushSync();
				expect(language()).toBe(lang);
			}
		});
		cleanup();
	});

	test('returns a string value (not undefined)', () => {
		const cleanup = $effect.root(() => {
			const language = useNavigatorLanguage();
			expect(typeof language()).toBe('string');
		});
		cleanup();
	});
});

import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useClipboard } from './useClipboard.svelte.js';

describe('useClipboard', () => {
	beforeEach(() => {
		vi.useFakeTimers();

		// Mock navigator.clipboard
		Object.defineProperty(navigator, 'clipboard', {
			value: {
				writeText: vi.fn(() => Promise.resolve())
			},
			writable: true,
			configurable: true
		});
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	test('text starts as empty string', () => {
		const cleanup = $effect.root(() => {
			const { text } = useClipboard();
			expect(text()).toBe('');
		});
		cleanup();
	});

	test('copied starts as false', () => {
		const cleanup = $effect.root(() => {
			const { copied } = useClipboard();
			expect(copied()).toBe(false);
		});
		cleanup();
	});

	test('copy updates text value', async () => {
		let textGetter!: () => string;
		let copyFn!: (value: string) => Promise<void>;

		const cleanup = $effect.root(() => {
			const { text, copy } = useClipboard();
			textGetter = text;
			copyFn = copy;
		});

		await copyFn('hello world');
		flushSync();
		expect(textGetter()).toBe('hello world');
		cleanup();
	});

	test('copied becomes true after copy', async () => {
		let copiedGetter!: () => boolean;
		let copyFn!: (value: string) => Promise<void>;

		const cleanup = $effect.root(() => {
			const { copied, copy } = useClipboard();
			copiedGetter = copied;
			copyFn = copy;
		});

		await copyFn('test');
		flushSync();
		expect(copiedGetter()).toBe(true);
		cleanup();
	});

	test('copied resets to false after 1500ms', async () => {
		let copiedGetter!: () => boolean;
		let copyFn!: (value: string) => Promise<void>;

		const cleanup = $effect.root(() => {
			const { copied, copy } = useClipboard();
			copiedGetter = copied;
			copyFn = copy;
		});

		await copyFn('test');
		flushSync();
		expect(copiedGetter()).toBe(true);

		vi.advanceTimersByTime(1500);
		flushSync();
		expect(copiedGetter()).toBe(false);
		cleanup();
	});

	test('copied remains true before 1500ms elapses', async () => {
		let copiedGetter!: () => boolean;
		let copyFn!: (value: string) => Promise<void>;

		const cleanup = $effect.root(() => {
			const { copied, copy } = useClipboard();
			copiedGetter = copied;
			copyFn = copy;
		});

		await copyFn('test');
		flushSync();

		vi.advanceTimersByTime(1499);
		flushSync();
		expect(copiedGetter()).toBe(true);
		cleanup();
	});

	test('calls navigator.clipboard.writeText with the value', async () => {
		let copyFn!: (value: string) => Promise<void>;

		const cleanup = $effect.root(() => {
			const { copy } = useClipboard();
			copyFn = copy;
		});

		await copyFn('clipboard value');
		expect(navigator.clipboard.writeText).toHaveBeenCalledWith('clipboard value');
		cleanup();
	});

	test('updating text with a second copy replaces the previous value', async () => {
		let textGetter!: () => string;
		let copyFn!: (value: string) => Promise<void>;

		const cleanup = $effect.root(() => {
			const { text, copy } = useClipboard();
			textGetter = text;
			copyFn = copy;
		});

		await copyFn('first');
		flushSync();
		await copyFn('second');
		flushSync();
		expect(textGetter()).toBe('second');
		cleanup();
	});
});

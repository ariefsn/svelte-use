import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useSpeechRecognition } from './useSpeechRecognition.svelte.js';

/** Minimal SpeechRecognition mock. */
function makeMockRecognition() {
	const instance = {
		continuous: false,
		interimResults: false,
		lang: '',
		start: vi.fn(),
		stop: vi.fn(),
		onresult: null as ((e: Event) => void) | null,
		onend: null as (() => void) | null,
		onerror: null as ((e: Event) => void) | null
	};
	return instance;
}

type MockRecognition = ReturnType<typeof makeMockRecognition>;

describe('useSpeechRecognition', () => {
	let mockInstance: MockRecognition;

	beforeEach(() => {
		mockInstance = makeMockRecognition();

		// vi.fn() with an arrow function cannot be used as a constructor (no `new`).
		// A constructor that explicitly returns an object causes `new` to return
		// that object, so all property mutations (onresult, onend, etc.) happen
		// on the shared mockInstance and remain observable in tests.
		const instance = mockInstance;
		function MockClass() {
			return instance;
		}
		vi.stubGlobal('SpeechRecognition', MockClass);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	test('result starts as empty string', () => {
		const cleanup = $effect.root(() => {
			const { result } = useSpeechRecognition();
			expect(result()).toBe('');
		});
		cleanup();
	});

	test('isListening starts as false', () => {
		const cleanup = $effect.root(() => {
			const { isListening } = useSpeechRecognition();
			expect(isListening()).toBe(false);
		});
		cleanup();
	});

	test('start sets isListening to true and calls recognition.start()', () => {
		const cleanup = $effect.root(() => {
			const { isListening, start } = useSpeechRecognition();
			start();
			flushSync();
			expect(isListening()).toBe(true);
			expect(mockInstance.start).toHaveBeenCalledTimes(1);
		});
		cleanup();
	});

	test('stop sets isListening to false and calls recognition.stop()', () => {
		const cleanup = $effect.root(() => {
			const { isListening, start, stop } = useSpeechRecognition();
			start();
			flushSync();
			expect(isListening()).toBe(true);

			stop();
			flushSync();
			expect(isListening()).toBe(false);
			expect(mockInstance.stop).toHaveBeenCalledTimes(1);
		});
		cleanup();
	});

	test('onend handler sets isListening to false', () => {
		const cleanup = $effect.root(() => {
			const { isListening, start } = useSpeechRecognition();
			start();
			flushSync();

			// Simulate recognition ending naturally
			mockInstance.onend?.();
			flushSync();

			expect(isListening()).toBe(false);
		});
		cleanup();
	});

	test('onerror handler sets isListening to false', () => {
		const cleanup = $effect.root(() => {
			const { isListening, start } = useSpeechRecognition();
			start();
			flushSync();

			mockInstance.onerror?.(new Event('error'));
			flushSync();

			expect(isListening()).toBe(false);
		});
		cleanup();
	});

	test('onresult updates the result string', () => {
		const cleanup = $effect.root(() => {
			const { result, start } = useSpeechRecognition();
			start();
			flushSync();

			// Simulate a recognition result event
			const mockResult = {
				isFinal: true,
				length: 1,
				0: { transcript: 'hello world', confidence: 0.9 },
				item: (_i: number) => ({ transcript: 'hello world', confidence: 0.9 })
			};
			const mockEvent = {
				results: {
					length: 1,
					0: mockResult,
					item: (_i: number) => mockResult
				}
			} as unknown as Event;

			mockInstance.onresult?.(mockEvent);
			flushSync();

			expect(result()).toBe('hello world');
		});
		cleanup();
	});

	test('gracefully degrades when SpeechRecognition is unavailable', () => {
		// Override the stub set in beforeEach with undefined values.
		vi.stubGlobal('SpeechRecognition', undefined);
		vi.stubGlobal('webkitSpeechRecognition', undefined);

		const cleanup = $effect.root(() => {
			const { result, isListening, start, stop } = useSpeechRecognition();

			// Should not throw
			start();
			stop();
			flushSync();

			expect(result()).toBe('');
			expect(isListening()).toBe(false);
		});
		cleanup();
	});

	test('enables continuous and interimResults on the recogniser', () => {
		const cleanup = $effect.root(() => {
			useSpeechRecognition();
			expect(mockInstance.continuous).toBe(true);
			expect(mockInstance.interimResults).toBe(true);
		});
		cleanup();
	});
});

import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useSpeechSynthesis } from './useSpeechSynthesis.svelte.js';

/**
 * Headless Chromium ships no voices and speaks nothing, so the API is stubbed.
 * `useSupported` evaluates its probe immediately, so stubs go in before the
 * composable is constructed.
 */

class FakeUtterance extends EventTarget {
	lang = '';
	voice: SpeechSynthesisVoice | null = null;
	rate = 1;
	pitch = 1;
	volume = 1;
	onstart: (() => void) | null = null;
	onend: (() => void) | null = null;
	onpause: (() => void) | null = null;
	onresume: (() => void) | null = null;
	onerror: ((event: SpeechSynthesisErrorEvent) => void) | null = null;

	constructor(readonly text: string) {
		super();
	}
}

function voice(name: string): SpeechSynthesisVoice {
	return {
		name,
		lang: 'en-GB',
		default: false,
		localService: true,
		voiceURI: name
	} as SpeechSynthesisVoice;
}

let spoken: FakeUtterance[] = [];
let availableVoices: SpeechSynthesisVoice[] = [];
let synth: EventTarget & {
	getVoices: () => SpeechSynthesisVoice[];
	speak: (u: FakeUtterance) => void;
	cancel: () => void;
	pause: () => void;
	resume: () => void;
};

beforeEach(() => {
	spoken = [];
	availableVoices = [];

	synth = Object.assign(new EventTarget(), {
		getVoices: () => availableVoices,
		speak: vi.fn((utterance: FakeUtterance) => {
			spoken.push(utterance);
			utterance.onstart?.();
		}),
		cancel: vi.fn(),
		pause: vi.fn(),
		resume: vi.fn()
	});

	vi.stubGlobal('speechSynthesis', synth);
	vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance);
});

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

describe('useSpeechSynthesis', () => {
	test('reports support', () => {
		const cleanup = $effect.root(() => {
			expect(useSpeechSynthesis().isSupported()).toBe(true);
		});
		cleanup();
	});

	test('fills voices from the voiceschanged event, not just the first read', () => {
		// Chrome returns [] from getVoices() until voices load asynchronously.
		// Reading once at init would leave the list permanently empty.
		let speech!: ReturnType<typeof useSpeechSynthesis>;
		const cleanup = $effect.root(() => {
			speech = useSpeechSynthesis();
		});
		flushSync();

		expect(speech.voices()).toEqual([]);

		availableVoices = [voice('Daniel'), voice('Fiona')];
		synth.dispatchEvent(new Event('voiceschanged'));
		flushSync();

		expect(speech.voices().map((v) => v.name)).toEqual(['Daniel', 'Fiona']);

		cleanup();
	});

	test('speak() applies the delivery settings', () => {
		const chosen = voice('Daniel');

		let speech!: ReturnType<typeof useSpeechSynthesis>;
		const cleanup = $effect.root(() => {
			speech = useSpeechSynthesis({
				lang: 'en-GB',
				voice: () => chosen,
				rate: 1.5,
				pitch: 0.8,
				volume: 0.4
			});
		});
		flushSync();

		speech.speak('Hello there');
		flushSync();

		expect(spoken).toHaveLength(1);
		expect(spoken[0].text).toBe('Hello there');
		expect(spoken[0].lang).toBe('en-GB');
		expect(spoken[0].voice).toBe(chosen);
		expect(spoken[0].rate).toBe(1.5);
		expect(spoken[0].pitch).toBe(0.8);
		expect(spoken[0].volume).toBe(0.4);

		cleanup();
	});

	test('a new speak() cancels what is queued rather than stacking', () => {
		// The queue is global; without a cancel, calls play one after another.
		let speech!: ReturnType<typeof useSpeechSynthesis>;
		const cleanup = $effect.root(() => {
			speech = useSpeechSynthesis();
		});
		flushSync();

		speech.speak('first');
		speech.speak('second');

		expect(synth.cancel).toHaveBeenCalledTimes(2);
		expect(spoken.map((u) => u.text)).toEqual(['first', 'second']);

		cleanup();
	});

	test('tracks status through start, pause, resume and end', () => {
		let speech!: ReturnType<typeof useSpeechSynthesis>;
		const cleanup = $effect.root(() => {
			speech = useSpeechSynthesis();
		});
		flushSync();

		expect(speech.status()).toBe('idle');

		speech.speak('hello');
		flushSync();
		expect(speech.status()).toBe('speaking');
		expect(speech.isSpeaking()).toBe(true);

		spoken[0].onpause?.();
		flushSync();
		expect(speech.status()).toBe('paused');
		expect(speech.isSpeaking()).toBe(false);

		spoken[0].onresume?.();
		flushSync();
		expect(speech.status()).toBe('speaking');

		spoken[0].onend?.();
		flushSync();
		expect(speech.status()).toBe('idle');

		cleanup();
	});

	test('treats canceled and interrupted as control flow, not errors', () => {
		let speech!: ReturnType<typeof useSpeechSynthesis>;
		const cleanup = $effect.root(() => {
			speech = useSpeechSynthesis();
		});
		flushSync();

		speech.speak('hello');
		flushSync();

		spoken[0].onerror?.({ error: 'canceled' } as SpeechSynthesisErrorEvent);
		flushSync();
		expect(speech.error()).toBeNull();
		expect(speech.status()).toBe('idle');

		speech.speak('again');
		spoken[1].onerror?.({ error: 'interrupted' } as SpeechSynthesisErrorEvent);
		flushSync();
		expect(speech.error()).toBeNull();

		cleanup();
	});

	test('records a genuine error', () => {
		let speech!: ReturnType<typeof useSpeechSynthesis>;
		const cleanup = $effect.root(() => {
			speech = useSpeechSynthesis();
		});
		flushSync();

		speech.speak('hello');
		spoken[0].onerror?.({ error: 'synthesis-failed' } as SpeechSynthesisErrorEvent);
		flushSync();

		expect(speech.error()?.error).toBe('synthesis-failed');
		expect(speech.status()).toBe('idle');

		cleanup();
	});

	test('stop() cancels and returns to idle', () => {
		let speech!: ReturnType<typeof useSpeechSynthesis>;
		const cleanup = $effect.root(() => {
			speech = useSpeechSynthesis();
		});
		flushSync();

		speech.speak('hello');
		flushSync();
		speech.stop();
		flushSync();

		expect(synth.cancel).toHaveBeenCalled();
		expect(speech.status()).toBe('idle');

		cleanup();
	});

	test('stops speaking when the scope is destroyed', () => {
		// The queue outlives the page, so navigating away would otherwise
		// leave the browser talking.
		const cleanup = $effect.root(() => {
			const speech = useSpeechSynthesis();
			speech.speak('a long passage');
		});
		flushSync();

		const before = vi.mocked(synth.cancel).mock.calls.length;
		cleanup();
		flushSync();

		expect(vi.mocked(synth.cancel).mock.calls.length).toBeGreaterThan(before);
	});

	test('does nothing when unsupported', () => {
		vi.stubGlobal('speechSynthesis', undefined);

		let speech!: ReturnType<typeof useSpeechSynthesis>;
		const cleanup = $effect.root(() => {
			speech = useSpeechSynthesis();
		});
		flushSync();

		expect(speech.isSupported()).toBe(false);
		expect(() => speech.speak('hello')).not.toThrow();
		expect(speech.voices()).toEqual([]);

		cleanup();
	});
});

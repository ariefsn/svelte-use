import { toGetter, type MaybeGetter } from '../internal/toGetter.js';
import { useEventListener } from './useEventListener.svelte.js';
import { useSupported } from './useSupported.svelte.js';

/** Playback state of the utterance. */
export type SpeechSynthesisStatus = 'idle' | 'speaking' | 'paused';

/** Options for `useSpeechSynthesis`. */
export interface UseSpeechSynthesisOptions {
	/** BCP 47 language tag, e.g. `'en-GB'`. Defaults to the document language. */
	lang?: MaybeGetter<string>;
	/** Voice to speak with. Pick one from `voices()`. */
	voice?: MaybeGetter<SpeechSynthesisVoice | null>;
	/** Speed, `0.1`–`10`. @default 1 */
	rate?: MaybeGetter<number>;
	/** Pitch, `0`–`2`. @default 1 */
	pitch?: MaybeGetter<number>;
	/** Volume, `0`–`1`. @default 1 */
	volume?: MaybeGetter<number>;
}

/** Return value of `useSpeechSynthesis`. */
export interface UseSpeechSynthesisReturn {
	/** Whether the Speech Synthesis API is available. */
	isSupported: () => boolean;
	/** Available voices. Empty until the browser has loaded them. */
	voices: () => readonly SpeechSynthesisVoice[];
	/** Current playback state. */
	status: () => SpeechSynthesisStatus;
	/** Whether speech is currently playing. */
	isSpeaking: () => boolean;
	/** The last error, or `null`. */
	error: () => SpeechSynthesisErrorEvent | null;
	/** Speaks the text, replacing anything currently queued. */
	speak: (text: string) => void;
	/** Pauses playback. */
	pause: () => void;
	/** Resumes after a pause. */
	resume: () => void;
	/** Stops playback and clears the queue. */
	stop: () => void;
}

/**
 * Text-to-speech via the Speech Synthesis API.
 *
 * Two behaviours of the underlying API are worth knowing, because both bite:
 *
 * - **`getVoices()` is empty on first call in Chrome.** Voices load
 *   asynchronously and announce themselves with a `voiceschanged` event, so
 *   reading once at init gives an empty list. This listens for that event, so
 *   `voices()` fills in on its own — but an empty list on the first render is
 *   normal.
 * - **The utterance queue belongs to the browser, not the page.** It keeps
 *   speaking after a component unmounts, and even after a client-side
 *   navigation. The teardown here calls `cancel()`, so leaving the page stops
 *   the voice.
 *
 * SSR: `isSupported()` is `false` and `speak()` does nothing.
 *
 * @param options - Voice, language and delivery settings
 * @returns Playback state plus `speak`, `pause`, `resume` and `stop`
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useSpeechSynthesis } from '@ariefsn/svelte-use';
 *
 *   const speech = useSpeechSynthesis({ rate: 1.1 });
 * </script>
 *
 * <button onclick={() => speech.speak('Hello there')} disabled={!speech.isSupported()}>
 *   Speak
 * </button>
 * <button onclick={speech.stop} disabled={!speech.isSpeaking()}>Stop</button>
 * ```
 */
export function useSpeechSynthesis(
	options: UseSpeechSynthesisOptions = {}
): UseSpeechSynthesisReturn {
	const isSupported = useSupported(
		() => typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance === 'function'
	);

	const getLang = options.lang === undefined ? null : toGetter(options.lang);
	const getVoice = options.voice === undefined ? null : toGetter(options.voice);
	const getRate = toGetter(options.rate ?? 1);
	const getPitch = toGetter(options.pitch ?? 1);
	const getVolume = toGetter(options.volume ?? 1);

	let voices = $state<readonly SpeechSynthesisVoice[]>([]);
	let status = $state<SpeechSynthesisStatus>('idle');
	let error = $state<SpeechSynthesisErrorEvent | null>(null);

	function refreshVoices(): void {
		if (!isSupported()) return;
		voices = speechSynthesis.getVoices();
	}

	function speak(text: string): void {
		if (!isSupported()) return;

		// The queue is global; without this, calls stack up and play in series.
		speechSynthesis.cancel();
		error = null;

		const utterance = new SpeechSynthesisUtterance(text);

		if (getLang) utterance.lang = getLang();
		if (getVoice) {
			const voice = getVoice();
			if (voice) utterance.voice = voice;
		}
		utterance.rate = getRate();
		utterance.pitch = getPitch();
		utterance.volume = getVolume();

		// Assigned in handlers, which run outside any tracking pass.
		utterance.onstart = () => {
			status = 'speaking';
		};
		utterance.onresume = () => {
			status = 'speaking';
		};
		utterance.onpause = () => {
			status = 'paused';
		};
		utterance.onend = () => {
			status = 'idle';
		};
		utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
			// `canceled` and `interrupted` are what stop() and a replacing
			// speak() produce — expected control flow, not failures.
			if (event.error !== 'canceled' && event.error !== 'interrupted') error = event;
			status = 'idle';
		};

		speechSynthesis.speak(utterance);
	}

	function pause(): void {
		if (!isSupported()) return;
		speechSynthesis.pause();
		status = 'paused';
	}

	function resume(): void {
		if (!isSupported()) return;
		speechSynthesis.resume();
		status = 'speaking';
	}

	function stop(): void {
		if (!isSupported()) return;
		speechSynthesis.cancel();
		status = 'idle';
	}

	// Chrome populates voices asynchronously; a one-shot read returns [].
	// `speechSynthesis` is not a Window/Document/HTMLElement, so this uses the
	// widened `useEventListener` overload.
	useEventListener(
		() => (typeof speechSynthesis === 'undefined' ? null : speechSynthesis),
		'voiceschanged',
		refreshVoices
	);

	$effect(() => {
		refreshVoices();
	});

	// Dependency-free: the browser keeps speaking after this scope is gone,
	// including across a client-side navigation.
	$effect(() => () => {
		if (isSupported()) speechSynthesis.cancel();
	});

	return {
		isSupported,
		voices: () => voices,
		status: () => status,
		isSpeaking: () => status === 'speaking',
		error: () => error,
		speak,
		pause,
		resume,
		stop
	};
}

/** Minimal typing for the Web Speech API SpeechRecognition interface. */
interface SpeechRecognitionInstance extends EventTarget {
	continuous: boolean;
	interimResults: boolean;
	lang: string;
	start(): void;
	stop(): void;
	onresult: ((event: SpeechRecognitionEvent) => void) | null;
	onend: (() => void) | null;
	onerror: ((event: Event) => void) | null;
}

interface SpeechRecognitionEvent extends Event {
	readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
	readonly length: number;
	item(index: number): SpeechRecognitionResult;
	[index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
	readonly isFinal: boolean;
	readonly length: number;
	item(index: number): SpeechRecognitionAlternative;
	[index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
	readonly transcript: string;
	readonly confidence: number;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

/** Vendor-prefixed constructor lookup. */
function getSpeechRecognition(): SpeechRecognitionConstructor | null {
	if (typeof window === 'undefined') return null;
	const w = window as Window &
		typeof globalThis & {
			SpeechRecognition?: SpeechRecognitionConstructor;
			webkitSpeechRecognition?: SpeechRecognitionConstructor;
		};
	return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * Return value of {@link useSpeechRecognition}.
 */
export interface UseSpeechRecognitionReturn {
	/** Getter returning the latest recognised transcript. */
	result: () => string;
	/** Getter returning `true` while recognition is active. */
	isListening: () => boolean;
	/** Starts the speech recognition session. No-op when unsupported. */
	start: () => void;
	/** Stops the speech recognition session. No-op when unsupported. */
	stop: () => void;
}

/**
 * Reactive Web Speech API wrapper.
 *
 * Exposes `start` and `stop` controls and a reactive `result` getter that
 * updates as the browser transcribes speech. Uses the vendor-prefixed
 * `webkitSpeechRecognition` as a fallback for Safari/Chrome compatibility.
 *
 * When the Speech Recognition API is unavailable (SSR, unsupported browser)
 * `start` and `stop` are no-ops, `result` returns `''`, and `isListening`
 * returns `false`.
 *
 * The recogniser is stopped and cleaned up when the reactive scope is
 * destroyed.
 *
 * @returns An object with `result`, `isListening`, `start`, and `stop`.
 *
 * @example
 * ```ts
 * const { result, isListening, start, stop } = useSpeechRecognition();
 * start();
 * isListening(); // true
 * result();      // live transcript
 * ```
 */
export function useSpeechRecognition(): UseSpeechRecognitionReturn {
	const SpeechRecognition = getSpeechRecognition();

	let result = $state<string>('');
	let isListening = $state<boolean>(false);
	let recognition: SpeechRecognitionInstance | null = null;

	if (SpeechRecognition) {
		recognition = new SpeechRecognition();
		recognition.continuous = true;
		recognition.interimResults = true;

		recognition.onresult = (event: SpeechRecognitionEvent) => {
			let transcript = '';
			for (let i = 0; i < event.results.length; i++) {
				transcript += event.results[i][0].transcript;
			}
			result = transcript;
		};

		recognition.onend = () => {
			isListening = false;
		};

		recognition.onerror = () => {
			isListening = false;
		};
	}

	function start(): void {
		if (!recognition) return;
		result = '';
		isListening = true;
		recognition.start();
	}

	function stop(): void {
		if (!recognition) return;
		recognition.stop();
		isListening = false;
	}

	$effect(() => {
		return () => {
			if (recognition && isListening) {
				recognition.stop();
			}
		};
	});

	return {
		result: () => result,
		isListening: () => isListening,
		start,
		stop
	};
}

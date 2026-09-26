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

interface SpeechRecognitionErrorEvent extends Event {
	/** Error code, e.g. `not-allowed`, `network`, `no-speech`, `aborted`. */
	readonly error: string;
	readonly message?: string;
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
 * Options for {@link useSpeechRecognition}.
 */
export interface UseSpeechRecognitionOptions {
	/** BCP 47 language tag, e.g. `'en-US'`. Defaults to the document language. */
	lang?: string;
	/** Keep listening after the first result (default: `true`). */
	continuous?: boolean;
	/** Emit partial results while the user is still speaking (default: `true`). */
	interimResults?: boolean;
}

/**
 * Return value of {@link useSpeechRecognition}.
 */
export interface UseSpeechRecognitionReturn {
	/** Getter returning the latest recognised transcript. */
	result: () => string;
	/** Getter returning `true` while recognition is active. */
	isListening: () => boolean;
	/** Getter returning `true` when the Web Speech API is available. */
	isSupported: () => boolean;
	/**
	 * Getter returning the last error code, or `null`.
	 *
	 * Common values: `not-allowed` (microphone permission denied),
	 * `network` (the browser's speech service is unreachable — frequent on
	 * Chromium forks that lack Google's speech API keys), `no-speech`,
	 * `aborted`, `service-not-allowed`.
	 */
	error: () => string | null;
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
export function useSpeechRecognition(
	options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
	const SpeechRecognition = getSpeechRecognition();
	const supported = SpeechRecognition !== null;

	let result = $state<string>('');
	let isListening = $state<boolean>(false);
	let error = $state<string | null>(null);
	let recognition: SpeechRecognitionInstance | null = null;

	if (SpeechRecognition) {
		recognition = new SpeechRecognition();
		recognition.continuous = options.continuous ?? true;
		recognition.interimResults = options.interimResults ?? true;
		if (options.lang) recognition.lang = options.lang;

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

		// Capture the error code rather than discarding it — without this every
		// failure (denied microphone, unreachable speech service, no speech)
		// looks identical to a normal stop.
		recognition.onerror = (event: Event) => {
			error = (event as SpeechRecognitionErrorEvent).error ?? 'unknown';
			isListening = false;
		};
	}

	function start(): void {
		if (!recognition) return;
		result = '';
		error = null;
		isListening = true;
		try {
			recognition.start();
		} catch (err) {
			// Calling start() while a previous session is still winding down
			// throws InvalidStateError; surface it instead of leaving the UI
			// stuck in a listening state that never began.
			error = err instanceof Error ? err.name : 'start-failed';
			isListening = false;
		}
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
		isSupported: () => supported,
		error: () => error,
		start,
		stop
	};
}

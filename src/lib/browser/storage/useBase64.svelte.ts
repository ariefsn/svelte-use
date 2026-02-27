/**
 * Converts a reactive `string`, `ArrayBuffer`, or `Blob` to its Base64
 * representation.
 *
 * - `string` values are encoded via `btoa` (UTF-8 safe via `TextEncoder`).
 * - `ArrayBuffer` values are encoded directly.
 * - `Blob` values are read asynchronously via `FileReader`.
 * - Returns `undefined` while an async Blob conversion is in-flight, or when
 *   the input is `undefined`, or in a non-browser environment (SSR safe).
 *
 * The returned getter is updated reactively whenever the input changes.
 *
 * @param input - Reactive getter returning a `string`, `ArrayBuffer`, `Blob`, or `undefined`
 * @returns A getter function returning the Base64-encoded string, or `undefined`
 *
 * @example
 * ```ts
 * let data = $state<string | undefined>('hello');
 * const b64 = useBase64(() => data);
 * // b64() → 'aGVsbG8='
 *
 * data = undefined;
 * // b64() → undefined
 * ```
 */
export function useBase64(
	input: () => string | ArrayBuffer | Blob | undefined
): () => string | undefined {
	const isBrowser = typeof window !== 'undefined';

	let result = $state<string | undefined>(undefined);

	function encodeArrayBuffer(buffer: ArrayBuffer): string {
		const bytes = new Uint8Array(buffer);
		let binary = '';
		for (let i = 0; i < bytes.byteLength; i++) {
			binary += String.fromCharCode(bytes[i]);
		}
		return btoa(binary);
	}

	function encodeString(str: string): string {
		const encoder = new TextEncoder();
		const bytes = encoder.encode(str);
		return encodeArrayBuffer(bytes.buffer as ArrayBuffer);
	}

	$effect(() => {
		const value = input();

		if (value === undefined) {
			result = undefined;
			return;
		}

		if (!isBrowser) {
			result = undefined;
			return;
		}

		if (typeof value === 'string') {
			result = encodeString(value);
			return;
		}

		if (value instanceof ArrayBuffer) {
			result = encodeArrayBuffer(value);
			return;
		}

		// Blob: read asynchronously via FileReader
		result = undefined;
		let cancelled = false;

		const reader = new FileReader();

		reader.onload = () => {
			if (cancelled) return;
			const dataUrl = reader.result as string;
			// data URL format: "data:<mime>;base64,<data>"
			const base64 = dataUrl.split(',')[1];
			result = base64;
		};

		reader.onerror = () => {
			if (cancelled) return;
			result = undefined;
		};

		reader.readAsDataURL(value);

		return () => {
			cancelled = true;
		};
	});

	return () => result;
}

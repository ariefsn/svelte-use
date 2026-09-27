/**
 * Reactively converts a `string`, `ArrayBuffer`, or `Blob` to its Base64 representation. Returns
 * `undefined` while an async Blob conversion is in-flight or on the server.
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

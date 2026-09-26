/**
 * Parses a text frame as JSON, falling back to the raw value.
 *
 * Message transports deliver a `string` for text frames and a binary type
 * (`Blob`, `ArrayBuffer`) otherwise. Only a string can be JSON, and a string
 * that is not valid JSON is a legitimate payload rather than an error — so a
 * failed parse returns the original value instead of throwing.
 *
 * Deliberately **not** used for `BroadcastChannel`, which transfers values by
 * structured clone: its `event.data` is already the value the sender posted,
 * so parsing it would corrupt a payload that happens to be a string.
 *
 * @param raw - The transport's `event.data`
 * @returns The parsed value, or `raw` unchanged when it is not JSON text
 *
 * @example
 * ```ts
 * parseMessageData<{ id: number }>('{"id":1}'); // → { id: 1 }
 * parseMessageData<string>('hello');            // → 'hello'
 * ```
 */
export function parseMessageData<T>(raw: string | T): T {
	if (typeof raw !== 'string') return raw as T;

	try {
		return JSON.parse(raw) as T;
	} catch {
		return raw as T;
	}
}

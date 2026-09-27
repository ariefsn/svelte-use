/** Parses a text frame as JSON, falling back to the raw value. */
export function parseMessageData<T>(raw: string | T): T {
	if (typeof raw !== 'string') return raw as T;

	try {
		return JSON.parse(raw) as T;
	} catch {
		return raw as T;
	}
}

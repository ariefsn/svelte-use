/**
 * Reactive object URL utility with automatic revocation.
 *
 * Calls `URL.createObjectURL` whenever the source object changes and
 * automatically calls `URL.revokeObjectURL` on the previous URL before
 * creating a new one, preventing memory leaks.
 *
 * Returns `undefined` when the source is `undefined` or when running in a
 * non-browser environment (SSR safe).
 *
 * @param object - Reactive getter returning a `Blob`, `File`, `MediaSource`, or `undefined`
 * @returns A getter function returning the current object URL, or `undefined`
 *
 * @example
 * ```ts
 * let file = $state<File | undefined>(undefined);
 * const url = useObjectUrl(() => file);
 * // url() → undefined
 * file = new File(['hello'], 'hello.txt');
 * // url() → 'blob:...'
 * ```
 */
export function useObjectUrl(
	object: () => Blob | File | MediaSource | undefined
): () => string | undefined {
	const isBrowser = typeof window !== 'undefined' && typeof URL !== 'undefined';

	let url = $state<string | undefined>(undefined);

	$effect(() => {
		const source = object();

		if (!isBrowser || source === undefined) {
			url = undefined;
			return;
		}

		const objectUrl = URL.createObjectURL(source);
		url = objectUrl;

		return () => {
			URL.revokeObjectURL(objectUrl);
		};
	});

	return () => url;
}

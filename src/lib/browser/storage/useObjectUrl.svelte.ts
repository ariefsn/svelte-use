/**
 * Generates a reactive `blob:` URL for a `Blob`, `File`, or `MediaSource` object. Automatically
 * revokes the previous URL when the source changes, preventing memory leaks.
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

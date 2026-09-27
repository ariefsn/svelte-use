/** Return value of {@link useClipboard}. */
export interface UseClipboardReturn {
	/** Getter returning the most recently copied text value. */
	text: () => string;
	/** Getter returning `true` for a brief period after a successful copy. */
	copied: () => boolean;
	/**
	 * Writes `value` to the clipboard. Uses `navigator.clipboard.writeText` when available, with a
	 * `document.execCommand` fallback for environments that do not support it.
	 */
	copy: (value: string) => Promise<void>;
}

/** Duration in milliseconds that `copied` remains `true` after a write. */
const COPIED_RESET_DELAY = 1500;

/**
 * Provides a reactive interface for reading and writing to the system clipboard, with a temporary
 * `copied` flag and a `document.execCommand` fallback.
 */
export function useClipboard(): UseClipboardReturn {
	const isBrowser = typeof navigator !== 'undefined';

	let text = $state<string>('');
	let copied = $state<boolean>(false);
	let resetTimer: ReturnType<typeof setTimeout> | undefined;

	async function copy(value: string): Promise<void> {
		if (!isBrowser) return;

		if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
			await navigator.clipboard.writeText(value);
		} else {
			// execCommand fallback
			const textarea = document.createElement('textarea');
			textarea.value = value;
			textarea.style.position = 'fixed';
			textarea.style.opacity = '0';
			document.body.appendChild(textarea);
			textarea.focus();
			textarea.select();
			document.execCommand('copy');
			document.body.removeChild(textarea);
		}

		text = value;
		copied = true;
		clearTimeout(resetTimer);
		resetTimer = setTimeout(() => {
			copied = false;
		}, COPIED_RESET_DELAY);
	}

	$effect(() => {
		return () => {
			clearTimeout(resetTimer);
		};
	});

	return {
		text: () => text,
		copied: () => copied,
		copy
	};
}

export interface UseFileDialogOptions {
	/** Accepted file types (default: `'*'`) */
	accept?: string;
	/** Allow multiple file selection (default: `false`) */
	multiple?: boolean;
}

export interface UseFileDialogReturn {
	/** The currently selected files */
	files: () => File[];
	/** Opens the file dialog */
	open: () => void;
	/** Clears selected files */
	reset: () => void;
}

/**
 * Programmatic file input dialog using a hidden `<input type="file">` element.
 *
 * @param options - Configuration for accepted types and multiple selection
 * @returns Object with `files`, `open`, and `reset`
 *
 * @example
 * ```ts
 * const { files, open, reset } = useFileDialog({ accept: 'image/*', multiple: true });
 * open(); // opens file picker
 * // files() → [File, File, ...]
 * ```
 */
export function useFileDialog(options: UseFileDialogOptions = {}): UseFileDialogReturn {
	const { accept = '*', multiple = false } = options;
	const isBrowser = typeof document !== 'undefined';

	let files = $state<File[]>([]);
	let input: HTMLInputElement | null = null;

	if (isBrowser) {
		input = document.createElement('input');
		input.type = 'file';
		input.accept = accept;
		input.multiple = multiple;
		input.style.display = 'none';

		input.addEventListener('change', () => {
			files = input?.files ? Array.from(input.files) : [];
		});
	}

	function open() {
		input?.click();
	}

	function reset() {
		files = [];
		if (input) {
			input.value = '';
		}
	}

	$effect(() => {
		return () => {
			if (input) {
				input.remove();
				input = null;
			}
		};
	});

	return {
		files: () => files,
		open,
		reset
	};
}

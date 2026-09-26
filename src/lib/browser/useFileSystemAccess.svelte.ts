import { useSupported } from './useSupported.svelte.js';

/*
 * TypeScript's `lib.dom` declares `FileSystemFileHandle` and
 * `createWritable()`, but not the two picker methods that hand one out. These
 * are module-local — never `declare global` — following the
 * `useSpeechRecognition` precedent, so nothing leaks into a consumer's types.
 */

/** A file type offered in a picker's filter dropdown. */
export interface FilePickerAcceptType {
	description?: string;
	/** MIME type to array of extensions, e.g. `{ 'text/plain': ['.txt'] }`. */
	accept: Record<string, readonly string[]>;
}

/** Options shared by both pickers. */
export interface FilePickerOptions {
	/** File types to offer. */
	types?: readonly FilePickerAcceptType[];
	/** Hide the "All files" option. */
	excludeAcceptAllOption?: boolean;
	/** Remembers the last directory per id across visits. */
	id?: string;
}

interface OpenFilePickerOptions extends FilePickerOptions {
	multiple?: boolean;
}

interface SaveFilePickerOptions extends FilePickerOptions {
	suggestedName?: string;
}

interface FileSystemWindow {
	showOpenFilePicker?: (
		options?: OpenFilePickerOptions
	) => Promise<readonly FileSystemFileHandle[]>;
	showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>;
}

/** The window, narrowed to the picker methods. */
function pickerWindow(): FileSystemWindow | null {
	if (typeof window === 'undefined') return null;
	return window as Window & FileSystemWindow;
}

/** Options for `useFileSystemAccess`. */
export interface UseFileSystemAccessOptions extends FilePickerOptions {
	/** Default name offered when saving. */
	suggestedName?: string;
}

/** Return value of `useFileSystemAccess`. */
export interface UseFileSystemAccessReturn {
	/** Whether the File System Access API is available — Chromium only today. */
	isSupported: () => boolean;
	/** The handle to the open file, or `null`. */
	fileHandle: () => FileSystemFileHandle | null;
	/** The opened `File`, or `null`. */
	file: () => File | null;
	/** Text content of the opened file, or `null`. */
	data: () => string | null;
	/** The file's name, or `null`. */
	fileName: () => string | null;
	/** The last error — `AbortError` when the user dismissed the picker. */
	error: () => DOMException | null;
	/** Whether a picker or a read/write is in progress. */
	isBusy: () => boolean;
	/** Opens a file picker and reads the chosen file as text. */
	open: () => Promise<string | null>;
	/** Writes to the open file, or opens a save picker when none is open. */
	save: (contents?: string) => Promise<boolean>;
	/** Opens a save picker for a new file, regardless of what is open. */
	saveAs: (contents?: string) => Promise<boolean>;
	/** Clears the handle and contents without touching the file. */
	close: () => void;
}

/**
 * Reading and **writing** real files, via the File System Access API.
 *
 * This is the piece `useFileDialog` and `useDropZone` cannot do: both acquire
 * a `File`, which is a read-only snapshot. Here you get a
 * `FileSystemFileHandle`, so `save()` writes back to the same file the user
 * opened — no re-download, no second picker.
 *
 * Both pickers must be called from a user gesture, and the user can dismiss
 * them, which surfaces as an `AbortError` in `error()` rather than a throw.
 *
 * Support is narrow: Chromium-based browsers only, and not in a cross-origin
 * iframe. Firefox and Safari have neither picker, so `isSupported()` is
 * `false` there and a download fallback is still needed.
 *
 * SSR: `isSupported()` is `false` and `open()` resolves `null`.
 *
 * @param options - File type filters and the suggested save name
 * @returns File state plus `open`, `save`, `saveAs` and `close`
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useFileSystemAccess } from '@ariefsn/svelte-use';
 *
 *   const fs = useFileSystemAccess({
 *     types: [{ description: 'Text', accept: { 'text/plain': ['.txt', '.md'] } }],
 *     suggestedName: 'notes.txt'
 *   });
 * </script>
 *
 * <button onclick={fs.open}>Open</button>
 * <button onclick={() => fs.save(draft)} disabled={!fs.fileHandle()}>Save</button>
 * <p>{fs.fileName() ?? 'No file open'}</p>
 * ```
 */
export function useFileSystemAccess(
	options: UseFileSystemAccessOptions = {}
): UseFileSystemAccessReturn {
	const { types, excludeAcceptAllOption, id, suggestedName } = options;

	const isSupported = useSupported(() => {
		const scope = pickerWindow();
		return (
			scope !== null &&
			typeof scope.showOpenFilePicker === 'function' &&
			typeof scope.showSaveFilePicker === 'function'
		);
	});

	let fileHandle = $state<FileSystemFileHandle | null>(null);
	let file = $state<File | null>(null);
	let data = $state<string | null>(null);
	let error = $state<DOMException | null>(null);
	let isBusy = $state(false);

	const pickerOptions = (): FilePickerOptions => ({ types, excludeAcceptAllOption, id });

	/**
	 * Records a failure, treating a dismissed picker as ordinary.
	 *
	 * Generic rather than `unknown`, so TypeScript's own narrowing types each
	 * branch — a `DOMException` stays one instead of being widened away.
	 */
	function capture<V>(cause: V): null {
		error = cause instanceof DOMException ? cause : new DOMException(String(cause), 'UnknownError');
		return null;
	}

	async function readHandle(handle: FileSystemFileHandle): Promise<string> {
		const opened = await handle.getFile();
		const text = await opened.text();
		fileHandle = handle;
		file = opened;
		data = text;
		return text;
	}

	async function open(): Promise<string | null> {
		const scope = pickerWindow();
		if (!isSupported() || !scope?.showOpenFilePicker) return null;

		isBusy = true;
		error = null;
		try {
			const [handle] = await scope.showOpenFilePicker({ ...pickerOptions(), multiple: false });
			if (!handle) return null;
			return await readHandle(handle);
		} catch (cause) {
			return capture(cause);
		} finally {
			isBusy = false;
		}
	}

	async function writeTo(handle: FileSystemFileHandle, contents: string): Promise<boolean> {
		const writable = await handle.createWritable();
		await writable.write(contents);
		// The file is not actually updated until the stream is closed.
		await writable.close();

		fileHandle = handle;
		data = contents;
		// Re-read so `file()` reflects the new size and modification time.
		file = await handle.getFile();
		return true;
	}

	async function saveAs(contents = ''): Promise<boolean> {
		const scope = pickerWindow();
		if (!isSupported() || !scope?.showSaveFilePicker) return false;

		isBusy = true;
		error = null;
		try {
			const handle = await scope.showSaveFilePicker({ ...pickerOptions(), suggestedName });
			return await writeTo(handle, contents);
		} catch (cause) {
			capture(cause);
			return false;
		} finally {
			isBusy = false;
		}
	}

	async function save(contents = ''): Promise<boolean> {
		// No handle yet means there is nothing to write back to, so this
		// becomes "save as" rather than failing.
		if (!fileHandle) return saveAs(contents);
		if (!isSupported()) return false;

		isBusy = true;
		error = null;
		try {
			return await writeTo(fileHandle, contents);
		} catch (cause) {
			capture(cause);
			return false;
		} finally {
			isBusy = false;
		}
	}

	function close(): void {
		fileHandle = null;
		file = null;
		data = null;
		error = null;
	}

	return {
		isSupported,
		fileHandle: () => fileHandle,
		file: () => file,
		data: () => data,
		fileName: () => file?.name ?? null,
		error: () => error,
		isBusy: () => isBusy,
		open,
		save,
		saveAs,
		close
	};
}

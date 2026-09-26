import { flushSync } from 'svelte';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { useFileSystemAccess } from './useFileSystemAccess.svelte.js';

/**
 * The File System Access API needs a user gesture and a real picker, so both
 * pickers are stubbed. `useSupported` evaluates immediately, so every stub is
 * installed before the composable is constructed.
 */

/** A writable stream that records what was written and when it closed. */
function makeWritable() {
	const written: string[] = [];
	let closed = false;
	return {
		written,
		isClosed: () => closed,
		stream: {
			write: vi.fn(async (contents: string) => {
				written.push(contents);
			}),
			close: vi.fn(async () => {
				closed = true;
			})
		}
	};
}

/**
 * A class, not an object literal, because `$state` deep-proxies plain objects
 * — a literal would come back from `fileHandle()` as a Proxy and fail identity
 * checks. A real `FileSystemFileHandle` is a class instance and is never
 * proxied, so this keeps the fake faithful to what ships.
 */
class FakeFileHandle {
	readonly kind = 'file' as const;
	readonly getFile: () => Promise<File>;
	readonly createWritable: () => Promise<ReturnType<typeof makeWritable>['stream']>;

	constructor(
		readonly name: string,
		writable: ReturnType<typeof makeWritable>,
		contents: string
	) {
		this.getFile = vi.fn(async () => new File([writable.written.at(-1) ?? contents], name));
		this.createWritable = vi.fn(async () => writable.stream);
	}
}

function makeHandle(name: string, contents = '') {
	const writable = makeWritable();
	const handle = new FakeFileHandle(name, writable, contents);
	return { handle: handle as unknown as FileSystemFileHandle, writable };
}

function stubPickers(overrides: {
	open?: () => Promise<readonly FileSystemFileHandle[]>;
	save?: () => Promise<FileSystemFileHandle>;
}) {
	const showOpenFilePicker = vi.fn(overrides.open ?? (async () => []));
	const showSaveFilePicker = vi.fn(
		overrides.save ?? (async () => makeHandle('untitled.txt').handle)
	);
	vi.stubGlobal('showOpenFilePicker', showOpenFilePicker);
	vi.stubGlobal('showSaveFilePicker', showSaveFilePicker);
	return { showOpenFilePicker, showSaveFilePicker };
}

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

describe('useFileSystemAccess', () => {
	test('reports unsupported when the pickers are absent', async () => {
		// Firefox and Safari, where a download fallback is still needed.
		vi.stubGlobal('showOpenFilePicker', undefined);
		vi.stubGlobal('showSaveFilePicker', undefined);

		let fs!: ReturnType<typeof useFileSystemAccess>;
		const cleanup = $effect.root(() => {
			fs = useFileSystemAccess();
		});

		expect(fs.isSupported()).toBe(false);
		expect(await fs.open()).toBeNull();
		expect(await fs.save('x')).toBe(false);

		cleanup();
	});

	test('open() reads the chosen file as text', async () => {
		const { handle } = makeHandle('notes.txt', 'hello world');
		stubPickers({ open: async () => [handle] });

		let fs!: ReturnType<typeof useFileSystemAccess>;
		const cleanup = $effect.root(() => {
			fs = useFileSystemAccess();
		});

		expect(await fs.open()).toBe('hello world');
		flushSync();

		expect(fs.data()).toBe('hello world');
		expect(fs.fileName()).toBe('notes.txt');
		expect(fs.fileHandle()).toBe(handle);
		expect(fs.error()).toBeNull();
		expect(fs.isBusy()).toBe(false);

		cleanup();
	});

	test('a dismissed picker is recorded as AbortError, not thrown', async () => {
		stubPickers({
			open: async () => {
				throw new DOMException('The user aborted a request.', 'AbortError');
			}
		});

		let fs!: ReturnType<typeof useFileSystemAccess>;
		const cleanup = $effect.root(() => {
			fs = useFileSystemAccess();
		});

		await expect(fs.open()).resolves.toBeNull();
		flushSync();

		expect(fs.error()?.name).toBe('AbortError');
		expect(fs.isBusy()).toBe(false);

		cleanup();
	});

	test('save() writes back to the handle already open', async () => {
		// The whole point: no second picker, no re-download.
		const { handle, writable } = makeHandle('notes.txt', 'original');
		const { showSaveFilePicker } = stubPickers({ open: async () => [handle] });

		let fs!: ReturnType<typeof useFileSystemAccess>;
		const cleanup = $effect.root(() => {
			fs = useFileSystemAccess();
		});

		await fs.open();
		expect(await fs.save('edited')).toBe(true);
		flushSync();

		expect(writable.written).toEqual(['edited']);
		// A write is not committed until the stream closes.
		expect(writable.isClosed()).toBe(true);
		expect(showSaveFilePicker).not.toHaveBeenCalled();
		expect(fs.data()).toBe('edited');

		cleanup();
	});

	test('save() falls back to a picker when nothing is open', async () => {
		const { handle, writable } = makeHandle('untitled.txt');
		const { showSaveFilePicker } = stubPickers({ save: async () => handle });

		let fs!: ReturnType<typeof useFileSystemAccess>;
		const cleanup = $effect.root(() => {
			fs = useFileSystemAccess();
		});

		expect(fs.fileHandle()).toBeNull();
		expect(await fs.save('fresh')).toBe(true);
		flushSync();

		expect(showSaveFilePicker).toHaveBeenCalled();
		expect(writable.written).toEqual(['fresh']);
		expect(fs.fileHandle()).toBe(handle);

		cleanup();
	});

	test('saveAs() always opens a picker, even with a file open', async () => {
		const opened = makeHandle('notes.txt', 'original');
		const target = makeHandle('copy.txt');
		const { showSaveFilePicker } = stubPickers({
			open: async () => [opened.handle],
			save: async () => target.handle
		});

		let fs!: ReturnType<typeof useFileSystemAccess>;
		const cleanup = $effect.root(() => {
			fs = useFileSystemAccess();
		});

		await fs.open();
		expect(await fs.saveAs('duplicated')).toBe(true);
		flushSync();

		expect(showSaveFilePicker).toHaveBeenCalled();
		expect(target.writable.written).toEqual(['duplicated']);
		expect(opened.writable.written).toEqual([]);
		expect(fs.fileHandle()).toBe(target.handle);

		cleanup();
	});

	test('passes the configured types and suggested name to the pickers', async () => {
		const types = [{ description: 'Text', accept: { 'text/plain': ['.txt'] } }];
		const { handle } = makeHandle('notes.txt');
		const { showOpenFilePicker, showSaveFilePicker } = stubPickers({
			open: async () => [handle],
			save: async () => handle
		});

		let fs!: ReturnType<typeof useFileSystemAccess>;
		const cleanup = $effect.root(() => {
			fs = useFileSystemAccess({ types, suggestedName: 'notes.txt', id: 'docs' });
		});

		await fs.open();
		expect(showOpenFilePicker).toHaveBeenCalledWith(
			expect.objectContaining({ types, id: 'docs', multiple: false })
		);

		await fs.saveAs('x');
		expect(showSaveFilePicker).toHaveBeenCalledWith(
			expect.objectContaining({ types, id: 'docs', suggestedName: 'notes.txt' })
		);

		cleanup();
	});

	test('close() clears state without touching the file', async () => {
		const { handle, writable } = makeHandle('notes.txt', 'content');
		stubPickers({ open: async () => [handle] });

		let fs!: ReturnType<typeof useFileSystemAccess>;
		const cleanup = $effect.root(() => {
			fs = useFileSystemAccess();
		});

		await fs.open();
		flushSync();
		fs.close();
		flushSync();

		expect(fs.fileHandle()).toBeNull();
		expect(fs.data()).toBeNull();
		expect(fs.fileName()).toBeNull();
		expect(writable.written).toEqual([]);

		cleanup();
	});

	test('open() resolves null when the picker returns nothing', async () => {
		stubPickers({ open: async () => [] });

		let fs!: ReturnType<typeof useFileSystemAccess>;
		const cleanup = $effect.root(() => {
			fs = useFileSystemAccess();
		});

		expect(await fs.open()).toBeNull();
		expect(fs.fileHandle()).toBeNull();

		cleanup();
	});
});

import { describe, expect, test } from 'vitest';
import * as lib from './index.js';

/*
 * Runs in the `server` project, where `window` is undefined. Every composable
 * advertises SSR safety, so constructing one must not throw and must not touch
 * a DOM global — these are the `typeof window`/`isBrowser` guards, which the
 * browser suites can never reach.
 */

/** Each entry constructs one composable with the least arguments it accepts. */
const constructors: Record<string, () => unknown> = {
	useActiveElement: () => lib.useActiveElement(),
	useBase64: () => lib.useBase64(() => ''),
	useBattery: () => lib.useBattery(),
	useBrowserLocation: () => lib.useBrowserLocation(),
	useClickOutside: () => lib.useClickOutside(() => null, () => {}),
	useClipboard: () => lib.useClipboard(),
	useColorMode: () => lib.useColorMode(),
	useCssVar: () => lib.useCssVar('--probe'),
	useDocumentVisibility: () => lib.useDocumentVisibility(),
	useDraggable: () => lib.useDraggable(null),
	useDropZone: () => lib.useDropZone(() => null),
	useElementBounding: () => lib.useElementBounding(() => null),
	useElementHover: () => lib.useElementHover(() => null),
	useFavicon: () => lib.useFavicon(),
	useFileDialog: () => lib.useFileDialog(),
	useFileSystemAccess: () => lib.useFileSystemAccess(),
	useFocus: () => lib.useFocus(() => null),
	useFullscreen: () => lib.useFullscreen(),
	useIdle: () => lib.useIdle(),
	useIndexedDB: () => lib.useIndexedDB('ssr-probe', 'notes'),
	useInfiniteScroll: () => lib.useInfiniteScroll(() => null, () => {}),
	useKeyModifier: () => lib.useKeyModifier('ctrl'),
	useMagicKeys: () => lib.useMagicKeys(),
	useMouse: () => lib.useMouse(),
	useMousePressed: () => lib.useMousePressed(),
	useNavigatorLanguage: () => lib.useNavigatorLanguage(),
	useNetwork: () => lib.useNetwork(),
	useOnline: () => lib.useOnline(),
	usePageLeave: () => lib.usePageLeave(),
	useScriptTag: () => lib.useScriptTag('/ssr-probe.js'),
	useScroll: () => lib.useScroll(),
	useScrollLock: () => lib.useScrollLock(),
	useSpeechRecognition: () => lib.useSpeechRecognition(),
	useStartTyping: () => lib.useStartTyping(() => {}),
	useStorage: () => lib.useStorage('ssr-probe', 0),
	useStyleTag: () => lib.useStyleTag('body{}'),
	useTextareaAutosize: () => lib.useTextareaAutosize(() => null),
	useTextDirection: () => lib.useTextDirection(),
	useTextSelection: () => lib.useTextSelection(),
	useTitle: () => lib.useTitle(),
	useUrlSearchParams: () => lib.useUrlSearchParams(),
	useWindowFocus: () => lib.useWindowFocus(),
	useWindowSize: () => lib.useWindowSize()
};

/** The subset that exposes a feature probe; the rest return a getter or nothing. */
const withSupport = Object.entries(constructors).filter(([, construct]) => {
	const api = construct() as { isSupported?: unknown } | undefined;
	return typeof api?.isSupported === 'function';
});

describe('SSR safety', () => {
	test('the server environment really has no DOM', () => {
		expect(typeof window).toBe('undefined');
		expect(typeof document).toBe('undefined');
	});

	test.for(Object.entries(constructors))('%s constructs without a DOM', ([, construct]) => {
		expect(() => construct()).not.toThrow();
	});

	test.for(withSupport)('%s reports no support on the server', ([, construct]) => {
		const api = construct() as { isSupported: () => boolean };
		expect(api.isSupported()).toBe(false);
	});

	test('useIndexedDB operations are inert no-ops', async () => {
		const db = lib.useIndexedDB<{ id?: number; text: string }>('ssr-probe', 'notes');
		await expect(db.getAll()).resolves.toEqual([]);
		await expect(db.get(1)).resolves.toBeUndefined();
		await expect(db.add({ text: 'x' })).resolves.toBeUndefined();
		await expect(db.update({ id: 1, text: 'y' })).resolves.toBeUndefined();
		await expect(db.remove(1)).resolves.toBeUndefined();
		await expect(db.query(() => true)).resolves.toEqual([]);
		await expect(db.clear()).resolves.toBeUndefined();
		expect(db.items).toEqual([]);
		expect(db.error).toBeNull();
	});

	test('useStorage falls back to the initial value', () => {
		const store = lib.useStorage('ssr-probe-key', 42);
		expect(store.value).toBe(42);
	});

	test('useTitle reports the initial title rather than reading document', () => {
		const title = lib.useTitle('Hello');
		expect(title.current()).toBe('Hello');
	});

	test('useOnline and useNavigatorLanguage return usable defaults', () => {
		expect(typeof lib.useOnline()()).toBe('boolean');
		expect(typeof lib.useNavigatorLanguage()()).toBe('string');
	});
});

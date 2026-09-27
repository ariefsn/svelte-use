import { toGetter, type MaybeGetter } from '../../internal/toGetter.js';
import {
	acquireHeadElement,
	type HeadElementHandle,
	type HeadElementOrigin
} from './internal/headElement.js';

/** Lifecycle of the injected script. */
export type ScriptTagStatus = 'idle' | 'loading' | 'loaded' | 'error';

/** Marks a tag whose load event has already fired, for later adopters. */
const LOADED_ATTRIBUTE = 'data-svelte-use-loaded';

/** Options for `useScriptTag`. */
export interface UseScriptTagOptions {
	/**
	 * Element id, and the dedupe key. Defaults to a value derived from `src`, so two components
	 * loading the same SDK share one tag automatically. Default `derived from `src``.
	 */
	id?: string;
	/** `async` attribute. Default `true`. */
	async?: boolean;
	/** `defer` attribute. Default `false`. */
	defer?: boolean;
	/** `type` attribute. Default `'text/javascript'`. */
	type?: string;
	/** `crossorigin` attribute. Default `undefined`. */
	crossOrigin?: 'anonymous' | 'use-credentials';
	/** `referrerpolicy` attribute. Default `undefined`. */
	referrerPolicy?: ReferrerPolicy;
	/** Subresource integrity hash. Default `undefined`. */
	integrity?: string;
	/** `nomodule` attribute. Default `false`. */
	noModule?: boolean;
	/** Append as soon as the composable initialises. Default `true`. */
	immediate?: boolean;
	/** Detach the tag once the last consumer's scope is destroyed. Default `false`. */
	removeOnDestroy?: boolean;
	/** Container to append into. Default `() => document.head`. */
	parent?: () => HTMLElement | null | undefined;
	/** Called once the script has executed. Default `undefined`. */
	onLoaded?: (element: HTMLScriptElement) => void;
	/** Called when the script fails to load. Default `undefined`. */
	onError?: (event: Event) => void;
}

/** Return value of `useScriptTag`. */
export interface UseScriptTagReturn {
	/** The element id in use. Stable, not reactive. */
	id: string;
	/** Current lifecycle status. */
	status: () => ScriptTagStatus;
	/** Whether the script is in flight. */
	isLoading: () => boolean;
	/** Whether the script has executed. */
	isLoaded: () => boolean;
	/** The failure event, or `null`. */
	error: () => Event | null;
	/** Appends the tag if absent and resolves once it has executed. */
	load: () => Promise<HTMLScriptElement>;
	/** Drops this consumer's reference. Idempotent. */
	unload: () => void;
}

/** The promise shared by every consumer of one script element. */
function createLoadPromise(
	element: HTMLScriptElement,
	origin: HeadElementOrigin
): Promise<HTMLScriptElement> {
	// An adopted tag already stamped as loaded fired its event before this
	// listener could exist.
	if (origin === 'adopted' && element.hasAttribute(LOADED_ATTRIBUTE)) {
		return Promise.resolve(element);
	}

	return new Promise<HTMLScriptElement>((resolve, reject) => {
		element.addEventListener(
			'load',
			() => {
				element.setAttribute(LOADED_ATTRIBUTE, '');
				resolve(element);
			},
			{ once: true }
		);
		element.addEventListener('error', (event: Event) => reject(event), { once: true });
	});
}

/** A stable, selector-safe id derived from the script URL. */
function idFromSrc(src: string): string {
	let hash = 0;
	for (let i = 0; i < src.length; i++) {
		hash = (hash * 31 + src.charCodeAt(i)) | 0;
	}
	return `svelte-use-script-${(hash >>> 0).toString(36)}`;
}

/** Loads an external script, deduplicated across every call site. */
export function useScriptTag(
	src: MaybeGetter<string>,
	options: UseScriptTagOptions = {}
): UseScriptTagReturn {
	const {
		async: isAsync = true,
		defer = false,
		type = 'text/javascript',
		crossOrigin,
		referrerPolicy,
		integrity,
		noModule = false,
		immediate = true,
		removeOnDestroy = false,
		parent: getParent = () => (typeof document === 'undefined' ? null : document.head),
		onLoaded,
		onError
	} = options;

	const getSrc = toGetter(src);
	const id = options.id ?? idFromSrc(getSrc());

	let handle: HeadElementHandle<HTMLScriptElement, Promise<HTMLScriptElement>> | null = null;
	let status = $state<ScriptTagStatus>('idle');
	let error = $state<Event | null>(null);
	/** Never settles during SSR, matching the documented behaviour. */
	let pending: Promise<HTMLScriptElement> | null = null;

	function load(): Promise<HTMLScriptElement> {
		if (pending) return pending;

		handle = acquireHeadElement({
			tag: 'script',
			id,
			parent: getParent() ?? null,
			init: (element) => {
				element.type = type;
				element.async = isAsync;
				element.defer = defer;
				element.noModule = noModule;
				if (crossOrigin) element.crossOrigin = crossOrigin;
				if (referrerPolicy) element.referrerPolicy = referrerPolicy;
				if (integrity) element.integrity = integrity;
				// Assigned last: setting src is what starts the fetch, so every
				// other attribute must already be in place.
				element.src = getSrc();
			},
			createShared: createLoadPromise
		});

		if (!handle) {
			pending = new Promise<HTMLScriptElement>(() => {});
			return pending;
		}

		status = 'loading';
		pending = handle.shared;

		pending.then(
			(element) => {
				status = 'loaded';
				error = null;
				onLoaded?.(element);
			},
			(event: Event) => {
				status = 'error';
				error = event;
				onError?.(event);
			}
		);

		return pending;
	}

	if (immediate) load();

	// Destroy-only, so no dependency is invented to register the teardown.
	// `release` is idempotent, so an explicit unload() first is harmless.
	$effect(() => () => {
		handle?.release(removeOnDestroy);
		handle = null;
	});

	return {
		id,
		status: () => status,
		isLoading: () => status === 'loading',
		isLoaded: () => status === 'loaded',
		error: () => error,
		load,
		unload: () => {
			handle?.release(removeOnDestroy);
			handle = null;
			pending = null;
			status = 'idle';
		}
	};
}

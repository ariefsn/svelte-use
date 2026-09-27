import { useDebounceFn } from '../performance/useDebounceFn.svelte.js';

/** How the parameters are located within the URL. */
export type UrlSearchParamsMode =
	/** `?a=1&b=2` — the standard query string. */
	| 'history'
	/** `#/route?a=1&b=2` — a query string inside the hash, after the first `?`. */
	| 'hash'
	/** `#a=1&b=2` — the entire hash is the parameter string. */
	| 'hash-params';

/** A parameter appearing once is a string; a repeated key becomes an array. */
export type UrlSearchParamValue = string | string[];

/** The parsed parameter set. */
export type UrlSearchParamsRecord = Record<string, UrlSearchParamValue>;

/** Options for `useUrlSearchParams`. */
export interface UseUrlSearchParamsOptions {
	/**
	 * How writes reach the URL. `'replace'` overwrites the current history entry, `'push'` adds one,
	 * and `false` keeps parameters in memory only. Default `'replace'`.
	 */
	write?: 'replace' | 'push' | false;
	/**
	 * Milliseconds to coalesce rapid writes. With `write: 'push'` this controls how many history
	 * entries a burst of changes produces. Default `0`.
	 */
	debounce?: number;
	/** Drop keys whose value is `''` or `[]` instead of emitting `?key=`. Default `true`. */
	removeEmptyValues?: boolean;
	/**
	 * Values applied at initialisation for keys the URL does not already define. Never overrides what
	 * is in the URL. Default `{}`.
	 */
	initial?: UrlSearchParamsRecord;
}

/** Return value of `useUrlSearchParams`. */
export interface UseUrlSearchParamsReturn {
	/**
	 * Snapshot of the current parameters. A fresh object each time it changes, so mutating it does
	 * nothing — use `set` / `remove` / `replace`.
	 */
	params: () => UrlSearchParamsRecord;
	/** One parameter, or `undefined` when absent. */
	get: (key: string) => UrlSearchParamValue | undefined;
	/** Sets one parameter and schedules a URL write. */
	set: (key: string, value: UrlSearchParamValue) => void;
	/** Removes one parameter and schedules a URL write. */
	remove: (key: string) => void;
	/** Replaces every parameter at once, in a single URL write. */
	replace: (next: UrlSearchParamsRecord) => void;
	/** Removes every parameter. */
	clear: () => void;
	/** The serialised parameter string in the URL, without a leading `?` or `#`. */
	query: () => string;
}

function parse(search: string): UrlSearchParamsRecord {
	const result: UrlSearchParamsRecord = {};
	// Transient parser, read-only and discarded before this function returns.
	const source = new URLSearchParams(search);

	for (const key of new Set(source.keys())) {
		const all = source.getAll(key);
		// A single occurrence stays a bare string: `?q=hello` should not force
		// every consumer to unwrap a one-element array.
		result[key] = all.length > 1 ? all : all[0];
	}

	return result;
}

function serialise(params: UrlSearchParamsRecord, removeEmptyValues: boolean): string {
	// Transient builder, serialised to a string before returning.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const target = new URLSearchParams();

	for (const [key, value] of Object.entries(params)) {
		if (Array.isArray(value)) {
			if (removeEmptyValues && value.length === 0) continue;
			// `append` per element preserves both order and repetition.
			for (const entry of value) target.append(key, entry);
			continue;
		}
		if (removeEmptyValues && value === '') continue;
		target.append(key, value);
	}

	return target.toString();
}

/** Reads the parameter string out of the current URL for the given mode. */
function extract(mode: UrlSearchParamsMode): string {
	if (typeof window === 'undefined') return '';

	if (mode === 'history') return window.location.search.replace(/^\?/, '');

	const hash = window.location.hash.replace(/^#/, '');
	if (mode === 'hash-params') return hash;

	const index = hash.indexOf('?');
	return index === -1 ? '' : hash.slice(index + 1);
}

/** Rebuilds the full URL with `query` substituted into the right slot. */
function composeUrl(query: string, mode: UrlSearchParamsMode): string {
	const { pathname, search, hash } = window.location;

	if (mode === 'history') {
		return `${pathname}${query ? `?${query}` : ''}${hash}`;
	}

	if (mode === 'hash-params') {
		return `${pathname}${search}${query ? `#${query}` : ''}`;
	}

	const bare = hash.replace(/^#/, '');
	const index = bare.indexOf('?');
	const route = index === -1 ? bare : bare.slice(0, index);
	const rebuilt = query ? `${route}?${query}` : route;

	return `${pathname}${search}${rebuilt ? `#${rebuilt}` : ''}`;
}

/**
 * Reads and writes URL parameters reactively. Tracks `popstate` and `hashchange`, so back/forward
 * navigation and external URL edits flow back into the parameters.
 */
export function useUrlSearchParams(
	mode: UrlSearchParamsMode = 'history',
	options: UseUrlSearchParamsOptions = {}
): UseUrlSearchParamsReturn {
	const { write = 'replace', debounce = 0, removeEmptyValues = true, initial = {} } = options;

	function readFromUrl(): UrlSearchParamsRecord {
		const fromUrl = parse(extract(mode));
		// `initial` fills gaps only; anything already in the URL wins.
		return { ...initial, ...fromUrl };
	}

	let params = $state<UrlSearchParamsRecord>(readFromUrl());

	/**
	 * The serialised string this composable last wrote. A plain variable, not `$state` — nothing
	 * should re-run when it changes.
	 */
	let lastWritten: string | null = null;

	function applyToUrl(next: UrlSearchParamsRecord) {
		if (typeof window === 'undefined' || write === false) return;

		const serialised = serialise(next, removeEmptyValues);
		if (serialised === lastWritten) return;

		lastWritten = serialised;
		const url = composeUrl(serialised, mode);

		if (write === 'push') window.history.pushState(window.history.state, '', url);
		else window.history.replaceState(window.history.state, '', url);
	}

	const scheduleWrite =
		debounce > 0
			? useDebounceFn(applyToUrl, debounce)
			: (next: UrlSearchParamsRecord) => applyToUrl(next);

	function commit(next: UrlSearchParamsRecord) {
		params = next;
		scheduleWrite(next);
	}

	$effect(() => {
		if (typeof window === 'undefined') return;

		function onNavigate() {
			const current = extract(mode);
			// Our own write coming back around; nothing changed.
			if (current === lastWritten) return;

			lastWritten = current;
			// Assigning reactive state from a listener runs outside the
			// tracking pass, so this is not a self-trigger.
			params = { ...initial, ...parse(current) };
		}

		window.addEventListener('popstate', onNavigate);
		window.addEventListener('hashchange', onNavigate);

		return () => {
			window.removeEventListener('popstate', onNavigate);
			window.removeEventListener('hashchange', onNavigate);
		};
	});

	return {
		params: () => params,
		get: (key: string) => params[key],
		set: (key: string, value: UrlSearchParamValue) => commit({ ...params, [key]: value }),
		remove: (key: string) => {
			const next = { ...params };
			delete next[key];
			commit(next);
		},
		replace: (next: UrlSearchParamsRecord) => commit({ ...next }),
		clear: () => commit({}),
		query: () => serialise(params, removeEmptyValues)
	};
}

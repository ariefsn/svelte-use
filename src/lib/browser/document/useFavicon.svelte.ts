import { toGetter, type MaybeGetter } from '../../internal/toGetter.js';
import { acquireHeadElement, type HeadElementHandle } from './internal/headElement.js';

/** Options for `useFavicon`. */
export interface UseFaviconOptions {
	/**
	 * `rel` of the managed link, and the selector used to adopt an existing one. Default `'icon'`.
	 */
	rel?: string;
	/** Set the link's `type` from the href's file extension. Default `true`. */
	inferType?: boolean;
	/** Restore the href present at initialisation when the scope is destroyed. Default `true`. */
	restoreOnDestroy?: boolean;
	/** Container to search and append into. Default `() => document.head`. */
	parent?: () => HTMLElement | null | undefined;
}

/** Return value of `useFavicon`. */
export interface UseFaviconReturn {
	/** The current favicon href, or `null` when none is set. */
	current: () => string | null;
	/** Sets the href. `null` restores the original, or removes a created link. */
	set: (href: string | null) => void;
}

/** The href the link carried before this library touched it. */
interface FaviconSnapshot {
	originalHref: string | null;
}

const MIME_BY_EXTENSION: Record<string, string> = {
	ico: 'image/x-icon',
	svg: 'image/svg+xml',
	png: 'image/png',
	gif: 'image/gif',
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	webp: 'image/webp',
	avif: 'image/avif'
};

function mimeFor(href: string): string | null {
	// Strip a query string or fragment before looking at the extension.
	const path = href.split(/[?#]/, 1)[0];
	const extension = path.slice(path.lastIndexOf('.') + 1).toLowerCase();
	return MIME_BY_EXTENSION[extension] ?? null;
}

/**
 * Reads and writes the document favicon. Adopts an existing `link rel="icon"` rather than appending
 * a second one, because browsers choose unpredictably among duplicates.
 */
export function useFavicon(
	href?: MaybeGetter<string | null | undefined>,
	options: UseFaviconOptions = {}
): UseFaviconReturn {
	const {
		rel = 'icon',
		inferType = true,
		restoreOnDestroy = true,
		parent: getParent = () => (typeof document === 'undefined' ? null : document.head)
	} = options;

	const getHref = href === undefined ? () => null : toGetter(href);

	let handle: HeadElementHandle<HTMLLinkElement, FaviconSnapshot> | null = null;

	if (typeof document !== 'undefined') {
		handle = acquireHeadElement({
			tag: 'link',
			id: `svelte-use-favicon-${rel}`,
			parent: getParent() ?? null,
			// An icon already in the document carries no library id, so adopt by
			// rel instead of duplicating it.
			adoptSelector: `link[rel="${rel}"]`,
			init: (element) => {
				element.rel = rel;
			},
			createShared: (element) => ({ originalHref: element.getAttribute('href') })
		});
	}

	let current = $state<string | null>(handle?.shared.originalHref ?? getHref() ?? null);

	function apply(next: string | null) {
		if (!handle) return;

		if (next === null) {
			const original = handle.shared.originalHref;
			if (original === null) handle.element.removeAttribute('href');
			else handle.element.href = original;
			return;
		}

		handle.element.href = next;
		if (inferType) {
			const mime = mimeFor(next);
			if (mime) handle.element.type = mime;
		}
	}

	$effect(() => {
		// Mirrors the source into `current`. Reads the source only, so it
		// cannot re-trigger on its own write.
		const next = getHref();
		if (next !== undefined && next !== null) current = next;
	});

	$effect(() => {
		// Mirrors `current` into the DOM. Writes no reactive state.
		apply(current);
	});

	// Destroy-only, so no dependency is invented to register the teardown.
	$effect(() => () => {
		if (!handle) return;
		// An adopted link is restored rather than removed; a created one is
		// removed, which the registry already gates on the refcount.
		if (restoreOnDestroy && handle.origin === 'adopted') apply(null);
		handle.release(true);
		handle = null;
	});

	return {
		current: () => current,
		set: (next: string | null) => {
			if (next === null) {
				current = handle?.shared.originalHref ?? null;
				apply(null);
				return;
			}
			current = next;
		}
	};
}

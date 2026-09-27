/** Distinguishes a tag this library created from one it merely found. */
export type HeadElementOrigin = 'created' | 'adopted';

export interface AcquireHeadElementOptions<K extends keyof HTMLElementTagNameMap, S> {
	/** Tag name to create when no existing element is found. */
	tag: K;
	/** Element id, and the dedupe key across every call site. */
	id: string;
	/** Container to search and append into. Defaults to `document.head`. */
	parent?: HTMLElement | null;
	/**
	 * Selector tried before creating, for adopting an element that exists but carries no library id —
	 * a favicon written into `app.html`, say. Searched within `parent`.
	 */
	adoptSelector?: string;
	/** Applied once, only when the element is created. Never re-applied on adopt. */
	init?: (element: HTMLElementTagNameMap[K]) => void;
	/**
	 * Builds the payload shared by every consumer of this element. Runs once per element, on first
	 * acquire — later consumers receive the same value.
	 */
	createShared: (element: HTMLElementTagNameMap[K], origin: HeadElementOrigin) => S;
}

export interface HeadElementHandle<E extends HTMLElement, S> {
	/** The live element. */
	element: E;
	/** Whether this library created it, or found it already in the document. */
	origin: HeadElementOrigin;
	/** Whether this handle is the one that created the element. */
	isOwner: boolean;
	/** The payload shared across every consumer of this element. */
	shared: S;
	/**
	 * Drops this handle's reference. Idempotent, so a manual unload plus teardown cannot
	 * double-decrement. Detaches only if `remove` && refcount 0 && origin is 'created'.
	 */
	release: (remove: boolean) => void;
}

interface Entry<S> {
	element: HTMLElement;
	origin: HeadElementOrigin;
	refs: number;
	shared: S;
}

/**
 * Live elements keyed by id. `Entry<never>` because the shared-payload type varies per entry;
 * `acquireHeadElement` is the only reader and casts back to its own `S`.
 */
const registry = new Map<string, Entry<never>>();

function findById(parent: HTMLElement, id: string): HTMLElement | null {
	const escaped =
		typeof CSS !== 'undefined' && typeof CSS.escape === 'function' ? CSS.escape(id) : id;
	try {
		return parent.querySelector<HTMLElement>(`#${escaped}`);
	} catch {
		// An id that cannot be escaped into a valid selector is not one we
		// could have written, so there is nothing to adopt.
		return null;
	}
}

/**
 * Creates or adopts a `<head>` child, deduplicated by id and reference counted. An adopted
 * element is never detached on release — this library did not put it there.
 */
export function acquireHeadElement<K extends keyof HTMLElementTagNameMap, S>(
	options: AcquireHeadElementOptions<K, S>
): HeadElementHandle<HTMLElementTagNameMap[K], S> | null {
	if (typeof document === 'undefined') return null;

	const { tag, id, adoptSelector, init, createShared } = options;
	const parent = options.parent ?? document.head;
	if (!parent) return null;

	const existing = registry.get(id) as Entry<S> | undefined;
	let entry: Entry<S>;
	let isOwner = false;

	if (existing) {
		existing.refs++;
		entry = existing;
	} else {
		const found =
			findById(parent, id) ??
			(adoptSelector ? parent.querySelector<HTMLElement>(adoptSelector) : null);

		if (found) {
			const element = found as HTMLElementTagNameMap[K];
			entry = { element, origin: 'adopted', refs: 1, shared: createShared(element, 'adopted') };
		} else {
			const element = document.createElement(tag);
			element.id = id;
			init?.(element);
			parent.appendChild(element);
			isOwner = true;
			entry = { element, origin: 'created', refs: 1, shared: createShared(element, 'created') };
		}

		registry.set(id, entry as Entry<never>);
	}

	let released = false;

	return {
		element: entry.element as HTMLElementTagNameMap[K],
		origin: entry.origin,
		isOwner,
		shared: entry.shared,
		release(remove: boolean) {
			if (released) return;
			released = true;
			entry.refs--;
			if (entry.refs > 0) return;

			// Only forget the entry when the element actually goes, so a later acquire still sees the
			// original origin and shared payload rather than re-adopting an element this library created.
			if (remove && entry.origin === 'created') {
				entry.element.remove();
				registry.delete(id);
			}
		}
	};
}

/** Clears the registry. Test-only; production code has no reason to call it. */
export function resetHeadElementRegistry(): void {
	registry.clear();
}

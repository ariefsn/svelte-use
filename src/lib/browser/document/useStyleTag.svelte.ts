import { toGetter, type MaybeGetter } from '../../internal/toGetter.js';
import { acquireHeadElement, type HeadElementHandle } from './internal/headElement.js';

/** Options for `useStyleTag`. */
export interface UseStyleTagOptions {
	/**
	 * Element id, and the dedupe key: two call sites sharing an id share one
	 * `<style>` element. Omit for a private tag with a generated id — an
	 * anonymous tag is never shared, so passing an explicit id is how a caller
	 * opts into sharing.
	 * @default a generated `svelte-use-style-<n>`
	 */
	id?: string;
	/**
	 * `media` attribute, e.g. `'print'`.
	 * @default undefined
	 */
	media?: string;
	/**
	 * Inject as soon as the composable initialises. When `false` nothing is
	 * appended until `load()` is called.
	 * @default true
	 */
	immediate?: boolean;
	/**
	 * Detach the tag once the last consumer's scope is destroyed. Scoped CSS
	 * should not outlive its component, so this defaults on — the opposite of
	 * `useScriptTag`, where re-running a script has side effects.
	 * @default true
	 */
	removeOnDestroy?: boolean;
	/**
	 * Container to append into.
	 * @default () => document.head
	 */
	parent?: () => HTMLElement | null | undefined;
}

/** Return value of `useStyleTag`. */
export interface UseStyleTagReturn {
	/** The element id in use, generated or supplied. Stable, not reactive. */
	id: string;
	/** The CSS text currently applied. */
	css: () => string;
	/** Whether the tag is currently in the document. */
	isLoaded: () => boolean;
	/**
	 * Replaces the CSS text. Overwritten again if a reactive `css` source is
	 * in use and later changes — the source wins.
	 */
	set: (css: string) => void;
	/** Appends the tag if absent. Idempotent. */
	load: () => void;
	/** Drops this consumer's reference. Idempotent. */
	unload: () => void;
}

let counter = 0;

/**
 * Injects a `<style>` element and keeps its contents in sync.
 *
 * Reactive CSS is re-applied on change without recreating the element. Tags
 * are deduplicated by id, so two components passing the same id share one
 * element and it survives until both release it.
 *
 * SSR safe: nothing is appended and `isLoaded()` stays `false`, while `css()`
 * still reports the resolved text.
 *
 * @param css - CSS text, or a getter for reactive CSS
 * @param options - id, media, and lifecycle behaviour
 * @returns Object with `id`, reactive `css` / `isLoaded`, and `set` / `load` / `unload`
 *
 * @example
 * ```ts
 * const tag = useStyleTag('.highlight { color: tomato; }');
 * tag.isLoaded(); // → true in a browser
 * ```
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useStyleTag } from '@ariefsn/svelte-use';
 *
 *   let hue = $state(200);
 *   useStyleTag(() => `.themed { color: hsl(${hue} 80% 60%); }`);
 * </script>
 *
 * <input type="range" min="0" max="360" bind:value={hue} />
 * <p class="themed">Recoloured as you drag.</p>
 * ```
 */
export function useStyleTag(
	css: MaybeGetter<string>,
	options: UseStyleTagOptions = {}
): UseStyleTagReturn {
	const {
		media,
		immediate = true,
		removeOnDestroy = true,
		parent: getParent = () => (typeof document === 'undefined' ? null : document.head)
	} = options;

	const getCss = toGetter(css);
	const id = options.id ?? `svelte-use-style-${++counter}`;

	let handle: HeadElementHandle<HTMLStyleElement, null> | null = null;
	/**
	 * The text actually applied.
	 *
	 * A *writable* `$derived`: `set()` can override it, and the next change to
	 * a reactive `css` source overwrites that override again — which is the
	 * documented precedence, and cheaper than mirroring the source through an
	 * effect.
	 */
	let applied = $derived(getCss());
	let isLoaded = $state(false);

	function load() {
		if (handle) return;

		handle = acquireHeadElement({
			tag: 'style',
			id,
			parent: getParent() ?? null,
			init: (element) => {
				if (media) element.media = media;
			},
			createShared: () => null
		});

		if (!handle) return;

		handle.element.textContent = applied;
		isLoaded = true;
	}

	function unload() {
		if (!handle) return;
		handle.release(removeOnDestroy);
		handle = null;
		isLoaded = false;
	}

	if (immediate) load();

	$effect(() => {
		// Mirrors `applied` into the DOM. Writes no reactive state.
		const current = applied;
		if (handle) handle.element.textContent = current;
	});

	// Destroy-only, so no dependency is invented to register the teardown.
	// `release` is idempotent, so an explicit unload() first is harmless.
	$effect(() => () => unload());

	return {
		id,
		css: () => applied,
		isLoaded: () => isLoaded,
		set: (next: string) => {
			applied = next;
		},
		load,
		unload
	};
}

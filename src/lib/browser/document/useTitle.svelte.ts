import { toGetter, type MaybeGetter } from '../../internal/toGetter.js';
import { useRestoreOnDestroy } from './internal/useRestoreOnDestroy.svelte.js';

/** Options for `useTitle`. */
export interface UseTitleOptions {
	/**
	 * Restore the title present when this composable initialised, once the
	 * owning scope is destroyed. Ignored in read-only mode, which never writes.
	 * @default true
	 */
	restoreOnDestroy?: boolean;
	/**
	 * Wraps the value before writing, e.g. ``(t) => `${t} — Acme` ``. Applied
	 * to `set()` calls too, so callers never pre-format.
	 * @default (title) => title
	 */
	template?: (title: string) => string;
	/**
	 * Track external writes to `document.title` with a `MutationObserver`.
	 * Costs an observer, and is only useful in read-only mode.
	 * @default false
	 */
	observe?: boolean;
}

/** Return value of `useTitle`. */
export interface UseTitleReturn {
	/** The current title. Reflects `document.title` in the browser. */
	current: () => string;
	/** Writes a new title, passing it through `template`. */
	set: (title: string) => void;
}

/**
 * Reads and writes `document.title`.
 *
 * Called with no argument it is **read-only**: it reports the current title and
 * never writes one. Called with a string or getter it owns the title, writing
 * on every change to the source.
 *
 * SSR: `current()` returns the resolved value so server-rendered UI that
 * displays the title is correct, but nothing is written — there is no
 * document. This does **not** set the server-rendered `<title>` element; use
 * `<svelte:head>` for that.
 *
 * @param title - Title to apply, or a getter for a reactive one. Omit for read-only.
 * @param options - Restore, template and observation behaviour
 * @returns Object with reactive `current` getter and `set` function
 *
 * @example
 * ```ts
 * const title = useTitle('Dashboard');
 * title.set('Dashboard — 3 alerts');
 * ```
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useTitle } from '@ariefsn/svelte-use';
 *
 *   let unread = $state(0);
 *   // Live counter in the tab, restored when the component unmounts
 *   useTitle(() => (unread > 0 ? `(${unread}) Inbox` : 'Inbox'));
 * </script>
 * ```
 */
export function useTitle(
	title?: MaybeGetter<string>,
	options: UseTitleOptions = {}
): UseTitleReturn {
	const { restoreOnDestroy = true, template = (value: string) => value, observe = false } = options;

	const isBrowser = typeof document !== 'undefined';
	/** Read-only mode: nothing was passed, so nothing is ever written. */
	const getSource = title === undefined ? null : toGetter(title);

	let current = $state(getSource ? template(getSource()) : isBrowser ? document.title : '');

	function write(next: string) {
		current = next;
		if (isBrowser) document.title = next;
	}

	// Snapshot before the write effect runs, so the captured value is the one
	// that existed beforehand — including a title set by an enclosing <Seo />.
	if (getSource && restoreOnDestroy && isBrowser) {
		useRestoreOnDestroy(
			() => document.title,
			(previous) => {
				document.title = previous;
			}
		);
	}

	if (getSource) {
		$effect(() => {
			// Reads the source only, never `current`, so writing `current` here
			// cannot re-trigger this effect.
			write(template(getSource()));
		});
	}

	if (observe) {
		$effect(() => {
			if (!isBrowser) return;

			const element = document.querySelector('title');
			if (!element) return;

			const observer = new MutationObserver(() => {
				// Runs in a callback, outside the tracking pass, so assigning
				// reactive state here is not a self-trigger.
				current = document.title;
			});

			observer.observe(element, { childList: true, characterData: true, subtree: true });

			return () => observer.disconnect();
		});
	}

	return {
		current: () => current,
		set: (next: string) => write(template(next))
	};
}

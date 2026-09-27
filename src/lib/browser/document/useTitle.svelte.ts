import { toGetter, type MaybeGetter } from '../../internal/toGetter.js';
import { useRestoreOnDestroy } from './internal/useRestoreOnDestroy.svelte.js';

/** Options for `useTitle`. */
export interface UseTitleOptions {
	/**
	 * Restore the title present when this composable initialised, once the owning scope is destroyed.
	 * Ignored in read-only mode, which never writes. Default `true`.
	 */
	restoreOnDestroy?: boolean;
	/**
	 * Wraps the value before writing, e.g. ``(t) => `${t} — Acme` ``. Applied to `set()` calls too,
	 * so callers never pre-format. Default `(title) => title`.
	 */
	template?: (title: string) => string;
	/**
	 * Track external writes to `document.title` with a `MutationObserver`. Costs an observer, and is
	 * only useful in read-only mode. Default `false`.
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
 * Reads and writes `document.title`. Called with no argument it is read-only and never writes;
 * called with a value it owns the title and restores the previous one on destroy.
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

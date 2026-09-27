import { toGetter, type MaybeGetter } from '../internal/toGetter.js';
import { useEventListener } from './useEventListener.svelte.js';
import { useSupported } from './useSupported.svelte.js';

/*
 * Safari still ships only the `webkit`-prefixed Fullscreen API, and TypeScript's `lib.dom` declares
 * none of it.
 */
interface WebkitFullscreenElement {
	webkitRequestFullscreen?: () => Promise<void> | void;
}

interface WebkitFullscreenDocument {
	webkitExitFullscreen?: () => Promise<void> | void;
	webkitFullscreenElement?: Element | null;
}

/** The element currently displayed fullscreen, across both spellings. */
function fullscreenElement(): Element | null {
	if (typeof document === 'undefined') return null;
	const webkit = document as Document & WebkitFullscreenDocument;
	return document.fullscreenElement ?? webkit.webkitFullscreenElement ?? null;
}

/** Options for `useFullscreen`. */
export interface UseFullscreenOptions {
	/** Leave fullscreen when the owning scope is destroyed. Default `true`. */
	exitOnDestroy?: boolean;
}

/** Return value of `useFullscreen`. */
export interface UseFullscreenReturn {
	/** Whether the Fullscreen API is available. */
	isSupported: () => boolean;
	/** Whether **this** target is the element currently displayed fullscreen. */
	isFullscreen: () => boolean;
	/** Requests fullscreen for the target. Must be called from a user gesture. */
	enter: () => Promise<void>;
	/** Leaves fullscreen, if this target is the one displayed. */
	exit: () => Promise<void>;
	/** Enters if not fullscreen, exits if it is. */
	toggle: () => Promise<void>;
}

/**
 * Displays an element fullscreen. `isFullscreen()` is driven by the `fullscreenchange` event rather
 * than by what was last called, because the user can leave with Escape without telling the page.
 */
export function useFullscreen(
	target?: MaybeGetter<HTMLElement | null | undefined>,
	options: UseFullscreenOptions = {}
): UseFullscreenReturn {
	const { exitOnDestroy = true } = options;

	const getTarget = target === undefined ? null : toGetter(target);

	const isSupported = useSupported(
		() =>
			typeof document !== 'undefined' &&
			(typeof document.documentElement.requestFullscreen === 'function' ||
				typeof (document.documentElement as HTMLElement & WebkitFullscreenElement)
					.webkitRequestFullscreen === 'function')
	);

	let isFullscreen = $state(false);

	/** The element this instance manages — the page root when none was given. */
	function resolveTarget(): HTMLElement | null {
		if (getTarget) return getTarget() ?? null;
		return typeof document === 'undefined' ? null : document.documentElement;
	}

	function sync(): void {
		const element = resolveTarget();
		isFullscreen = element !== null && fullscreenElement() === element;
	}

	async function enter(): Promise<void> {
		const element = resolveTarget();
		if (!isSupported() || !element) return;

		const webkit = element as HTMLElement & WebkitFullscreenElement;
		if (typeof element.requestFullscreen === 'function') await element.requestFullscreen();
		else await webkit.webkitRequestFullscreen?.();

		sync();
	}

	async function exit(): Promise<void> {
		if (!isSupported() || typeof document === 'undefined') return;
		// Only leave if this target is the one on screen; exiting on behalf of
		// someone else's element would be surprising.
		if (fullscreenElement() !== resolveTarget()) return;

		const webkit = document as Document & WebkitFullscreenDocument;
		if (typeof document.exitFullscreen === 'function') await document.exitFullscreen();
		else await webkit.webkitExitFullscreen?.();

		sync();
	}

	function toggle(): Promise<void> {
		return isFullscreen ? exit() : enter();
	}

	// Escape leaves fullscreen without telling the page, so the event is the
	// only trustworthy source for this state.
	useEventListener(() => document, 'fullscreenchange', sync);
	// Safari's prefixed event is not in `DocumentEventMap`; widening the target
	// to `EventTarget` routes it through the generic overload instead.
	useEventListener(
		() => document as EventTarget,
		'webkitfullscreenchange',
		sync as (event: Event) => void
	);

	$effect(() => {
		sync();
	});

	if (exitOnDestroy) {
		// Dependency-free: a re-run would exit the fullscreen it just entered.
		$effect(() => () => {
			if (fullscreenElement() !== resolveTarget()) return;

			/*
			 * Swallowed deliberately: teardown often runs while the document is going
			 * away, and `exitFullscreen()` then rejects with "Document not active".
			 */
			exit().catch(() => {});
		});
	}

	return {
		isSupported,
		isFullscreen: () => isFullscreen,
		enter,
		exit,
		toggle
	};
}

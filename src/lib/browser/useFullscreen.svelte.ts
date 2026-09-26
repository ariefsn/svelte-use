import { toGetter, type MaybeGetter } from '../internal/toGetter.js';
import { useEventListener } from './useEventListener.svelte.js';
import { useSupported } from './useSupported.svelte.js';

/*
 * Safari still ships only the `webkit`-prefixed Fullscreen API, and TypeScript's
 * `lib.dom` declares none of it. These mirror the `useSpeechRecognition`
 * precedent: module-local interfaces plus a narrow cast, never `declare global`,
 * so nothing leaks into a consumer's type environment.
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
	/**
	 * Leave fullscreen when the owning scope is destroyed.
	 *
	 * Without this, navigating away from a component that entered fullscreen
	 * leaves the whole page stuck there.
	 * @default true
	 */
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
 * Displays an element fullscreen.
 *
 * `enter()` must be called from a user gesture — browsers reject a request
 * that is not, which surfaces as a rejected promise rather than a silent
 * no-op. The user can also leave fullscreen at any time with Escape, without
 * telling the page, so `isFullscreen()` is driven by the `fullscreenchange`
 * event rather than by what this composable last did.
 *
 * `isFullscreen()` is specifically about **this** target: another element
 * being fullscreen reports `false` here, which is what makes per-element
 * toggle buttons behave.
 *
 * SSR: `isSupported()` is `false` and `enter()` resolves without doing
 * anything.
 *
 * @param target - Element to display, or a getter. Defaults to the whole page.
 * @param options - Whether to exit when the scope is destroyed
 * @returns Fullscreen state plus `enter`, `exit` and `toggle`
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useFullscreen } from '@ariefsn/svelte-use';
 *
 *   let player = $state<HTMLElement | null>(null);
 *   const fullscreen = useFullscreen(() => player);
 * </script>
 *
 * <div bind:this={player}>
 *   <button onclick={fullscreen.toggle}>
 *     {fullscreen.isFullscreen() ? 'Exit' : 'Go'} fullscreen
 *   </button>
 * </div>
 * ```
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
			if (fullscreenElement() === resolveTarget()) void exit();
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

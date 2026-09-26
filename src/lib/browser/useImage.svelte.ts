import { toGetter, type MaybeGetter } from '../internal/toGetter.js';

/** What to load. Mirrors the attributes of an `<img>`. */
export interface UseImageSource {
	/** The image URL. */
	src: string;
	/** Responsive candidates, as in `srcset`. */
	srcset?: string;
	/** Which candidate to pick, as in `sizes`. */
	sizes?: string;
	/** Alternative text, forwarded to the underlying element. */
	alt?: string;
	/** CORS mode, needed before an image can be drawn to a canvas and read back. */
	crossorigin?: 'anonymous' | 'use-credentials';
	/** Referrer policy for the request. */
	referrerPolicy?: ReferrerPolicy;
}

/** Return value of `useImage`. */
export interface UseImageReturn {
	/** Whether a load is in progress. */
	isLoading: () => boolean;
	/** The loaded element, or `null` before it resolves or after a failure. */
	image: () => HTMLImageElement | null;
	/** The failure, or `null`. Image errors carry no detail, so this is synthesised. */
	error: () => Error | null;
	/** Whether the current source loaded successfully. */
	isReady: () => boolean;
	/** Loads again, e.g. to retry after a failure. */
	refresh: () => void;
}

/**
 * Preloads an image and tracks its state.
 *
 * Loading happens on a detached `Image`, so the browser has the bytes cached
 * before the `<img>` that shows it is ever rendered — which is how you avoid a
 * layout jump or a flash of empty space.
 *
 * A reactive source reloads automatically, and a result arriving for a source
 * that is no longer current is discarded rather than overwriting fresher state.
 *
 * SSR: nothing loads, `isLoading()` is `false` and `image()` is `null`.
 *
 * @param source - The image to load, or a getter for a reactive one
 * @returns Load state plus `refresh`
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useImage } from '@ariefsn/svelte-use';
 *
 *   let id = $state(1);
 *   const avatar = useImage(() => ({ src: `/avatars/${id}.png`, alt: 'Avatar' }));
 * </script>
 *
 * {#if avatar.isLoading()}
 *   <div class="skeleton"></div>
 * {:else if avatar.error()}
 *   <img src="/avatars/fallback.png" alt="Avatar" />
 * {:else}
 *   <img src={avatar.image()?.src} alt="Avatar" />
 * {/if}
 * ```
 */
export function useImage(source: MaybeGetter<UseImageSource>): UseImageReturn {
	const getSource = toGetter(source);

	let isLoading = $state(false);
	let image = $state<HTMLImageElement | null>(null);
	let error = $state<Error | null>(null);

	// Plain `let`: identifies the current load so a stale result can be
	// recognised and dropped, the same guard `useMediaStream` uses.
	let generation = 0;
	let reloadKey = $state(0);

	function load(config: UseImageSource): void {
		if (typeof Image === 'undefined') return;

		const attempt = ++generation;

		isLoading = true;
		image = null;
		error = null;

		const element = new Image();

		// Every attribute must be set before `src`, or the browser may start
		// fetching with the wrong CORS mode or pick the wrong srcset candidate.
		if (config.crossorigin !== undefined) element.crossOrigin = config.crossorigin;
		if (config.referrerPolicy !== undefined) element.referrerPolicy = config.referrerPolicy;
		if (config.sizes !== undefined) element.sizes = config.sizes;
		if (config.srcset !== undefined) element.srcset = config.srcset;
		if (config.alt !== undefined) element.alt = config.alt;
		element.src = config.src;

		element.onload = () => {
			if (attempt !== generation) return;
			image = element;
			isLoading = false;
		};

		element.onerror = () => {
			if (attempt !== generation) return;
			// The DOM error event for an image carries no useful detail — no
			// status, no reason — so the URL is the only thing worth reporting.
			error = new Error(`Failed to load image: ${config.src}`);
			isLoading = false;
		};
	}

	function refresh(): void {
		reloadKey += 1;
	}

	$effect(() => {
		const config = getSource();
		// A deliberate dependency, not the "fake dep so teardown registers"
		// anti-pattern: re-running on demand is exactly what `refresh()` means,
		// and this effect writes none of the state it reads.
		void reloadKey;
		load(config);
	});

	return {
		isLoading: () => isLoading,
		image: () => image,
		error: () => error,
		isReady: () => image !== null,
		refresh
	};
}

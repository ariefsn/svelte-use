import { toGetter, type MaybeGetter } from '../internal/toGetter.js';
import { buildTags, resolveTitle } from './internal/buildTags.js';
import { mergeSeo } from './internal/mergeSeo.js';
import type { SeoData, SeoTag } from './types.js';

/** One layer of SEO data, or a getter for a reactive one. */
export type SeoLayer = MaybeGetter<SeoData | undefined | null>;

/** Return value of `useSeo`. */
export interface UseSeoReturn {
	/** The merged data, for passing to `<Seo />`. */
	data: () => SeoData;
	/** The resolved title, with `titleTemplate` applied. `undefined` when there is none. */
	title: () => string | undefined;
	/** The tags to render, each with a stable `key`. */
	tags: () => readonly SeoTag[];
}

/**
 * Builds SEO metadata from layered defaults and overrides.
 *
 * This is a **builder, not a mutator**. It returns the tags for you to render
 * inside `<svelte:head>` — usually via `<Seo />` — so they end up in the
 * server-rendered HTML. That is the whole point: crawlers and link unfurlers
 * (Slack, Discord, WhatsApp, iMessage) mostly do not execute JavaScript, so
 * metadata written to `document.head` in an effect is invisible to exactly the
 * consumers it exists to serve.
 *
 * Layers merge last-wins **per key**, recursing one level into `og` and
 * `twitter`, so a page overriding only `og.type` keeps the layout's
 * `og.siteName` and `og.image`.
 *
 * There is no `$effect` here at all, so this can be called from a module scope
 * or a `.svelte.ts` file as well as from a component.
 *
 * Use this for metadata that must be in the HTML; use `useTitle` for a title
 * that changes in response to app state, such as an unread count.
 *
 * @param layers - Ordered layers, later ones overriding earlier ones
 * @returns The merged `data`, resolved `title` and the `tags` to render
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { Seo, useSeo, type SeoData } from '@ariefsn/svelte-use';
 *   import { page } from '$app/state';
 *
 *   const defaults: SeoData = {
 *     titleTemplate: '%s — Acme',
 *     baseUrl: 'https://acme.test',
 *     og: { siteName: 'Acme', image: '/og.png', type: 'website' },
 *     twitter: { card: 'summary' }
 *   };
 *
 *   const seo = useSeo(defaults, () => page.data.seo, () => ({ canonical: page.url.pathname }));
 * </script>
 *
 * <Seo data={seo.data()} />
 * ```
 */
export function useSeo(...layers: readonly SeoLayer[]): UseSeoReturn {
	const getters = layers.map((layer) => toGetter(layer));

	const data = $derived(mergeSeo(getters.map((get) => get())));
	const tags = $derived(buildTags(data));

	return {
		data: () => data,
		title: () => resolveTitle(data),
		tags: () => tags
	};
}

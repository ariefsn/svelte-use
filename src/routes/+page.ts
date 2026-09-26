import type { SeoData } from '$lib';
import { sidebar } from '../docs/sidebar.js';

/**
 * Homepage metadata.
 *
 * It lives in a `load` rather than a `<svelte:head>` block because the single
 * `<Seo />` in `+layout.svelte` is the one render site — a second head block
 * here would emit duplicate meta tags, and crawlers take the first.
 */
export const load = () => {
	const totalComposables = sidebar.reduce((count, group) => count + group.items.length, 0);

	return {
		seo: {
			title: 'Svelte 5 Utility Composables',
			// The layout's `%s — Svelte Use` template would read oddly on the
			// homepage, so this one supplies its own full title.
			titleTemplate: '%s · Svelte Use',
			description: `A collection of ${totalComposables}+ Svelte 5 runes-first utility composables. No stores, no external dependencies, SSR-safe, fully typed.`,
			og: { type: 'website' }
		} satisfies SeoData
	};
};

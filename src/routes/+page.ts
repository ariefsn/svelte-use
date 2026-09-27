import type { SeoData } from '$lib';
import { sidebar } from '../docs/sidebar.js';

/** Homepage metadata. */
export const load = () => {
	const allItems = sidebar.flatMap((group) => group.items);
	// Matches the split in +page.svelte: `Seo` is a component, not a composable.
	const composableCount = allItems.filter((item) => item.label.startsWith('use')).length;

	return {
		seo: {
			title: 'Svelte 5 Utility Composables',
			// The layout's `%s — Svelte Use` template would read oddly on the
			// homepage, so this one supplies its own full title.
			titleTemplate: '%s · Svelte Use',
			description: `A collection of ${composableCount} Svelte 5 runes-first utility composables plus an SEO component. No stores, no external dependencies, SSR-safe, fully typed.`,
			og: { type: 'website' }
		} satisfies SeoData
	};
};

import { error } from '@sveltejs/kit';
import type { SeoData } from '$lib';
import { stripInline } from '../../../docs/format.js';
import { relatedFor } from '../../../docs/related.js';
import { pages } from '../../../docs/pages.js';
import { allSlugs } from '../../../docs/sidebar.js';
import type { PageServerLoad } from './$types.js';

export const prerender = true;

export function entries() {
	return allSlugs.map((slug) => ({ slug }));
}

export const load: PageServerLoad = ({ params }) => {
	const page = pages[params.slug];
	if (!page) {
		error(404, `No documentation found for "${params.slug}"`);
	}
	return {
		page,
		/*
		 * Derived server-side on purpose. `related.ts` imports `pages.ts`, which
		 * is 260KB — deriving this in the component would pull all of it into the
		 * client bundle for the sake of four links.
		 */
		related: relatedFor(params.slug),
		/*
		 * Merged into the layout defaults by the single `<Seo />` there.
		 * `stripInline` is what keeps the doc copy's backticks and asterisks
		 * out of the meta description — markup leaking into SEO tags was the
		 * original reason that helper exists.
		 */
		seo: {
			title: page.title,
			description: stripInline(page.description),
			og: { type: 'article' },
			// Only read because `og.type` is 'article'. `section` is Open
			// Graph's equivalent of a category; there is no `og:category`.
			article: { section: 'Documentation', tags: ['svelte', 'svelte-5', 'runes'] }
		} satisfies SeoData
	};
};

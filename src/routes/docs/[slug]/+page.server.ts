import type { PageServerLoad } from './$types.js';
import { error } from '@sveltejs/kit';
import { pages } from '$lib/docs/pages.js';
import { allSlugs } from '$lib/docs/sidebar.js';

export const prerender = true;

export function entries() {
	return allSlugs.map((slug) => ({ slug }));
}

export const load: PageServerLoad = ({ params }) => {
	const page = pages[params.slug];
	if (!page) {
		error(404, `No documentation found for "${params.slug}"`);
	}
	return { page };
};

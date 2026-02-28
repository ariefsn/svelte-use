import { error } from '@sveltejs/kit';
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
	return { page };
};

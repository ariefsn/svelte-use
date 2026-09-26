// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { SeoData } from '$lib';

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		interface PageData {
			/**
			 * Per-page SEO overrides, merged into the layout defaults by the
			 * single `<Seo />` in `+layout.svelte`.
			 *
			 * Declaring it here is what makes `page.data.seo` typed at the use
			 * site; without it the whole thing is `any` exactly where the
			 * typing matters.
			 */
			seo?: SeoData;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};

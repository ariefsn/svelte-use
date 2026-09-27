// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { SeoData } from '$lib';

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		interface PageData {
			/**
			 * Per-page SEO overrides, merged into the layout defaults by the single `<Seo />` in
			 * `+layout.svelte`.
			 */
			seo?: SeoData;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};

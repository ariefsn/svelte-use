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

/** Builds SEO metadata from layered defaults and overrides. */
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

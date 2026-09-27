import type { SeoArticle, SeoData, SeoOpenGraph, SeoTwitter } from '../types.js';

/** Copies defined keys from `patch` over `base`, leaving `undefined` alone. */
function overlay<T extends object>(base: T | undefined, patch: T | undefined): T | undefined {
	if (!patch) return base;
	if (!base) return patch;

	const merged = { ...base } as Record<string, unknown>;
	for (const [key, value] of Object.entries(patch)) {
		// `undefined` means "not specified", not "clear it" — otherwise a
		// layer that mentions a key at all would erase the layer beneath.
		if (value !== undefined) merged[key] = value;
	}
	return merged as T;
}

/**
 * Folds SEO layers together, last one winning per key.
 * @internal
 */
export function mergeSeo(layers: readonly (SeoData | undefined | null)[]): SeoData {
	const result: SeoData = {};

	for (const layer of layers) {
		if (!layer) continue;

		for (const [key, value] of Object.entries(layer)) {
			if (value === undefined) continue;

			if (key === 'og') {
				result.og = overlay<SeoOpenGraph>(result.og, value as SeoOpenGraph);
			} else if (key === 'twitter') {
				result.twitter = overlay<SeoTwitter>(result.twitter, value as SeoTwitter);
			} else if (key === 'article') {
				result.article = overlay<SeoArticle>(result.article, value as SeoArticle);
			} else {
				Object.assign(result, { [key]: value });
			}
		}
	}

	return result;
}

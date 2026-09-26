import type { SeoData, SeoTag } from '../types.js';

/** Applies `titleTemplate` to `title`, if both are present. */
export function resolveTitle(data: SeoData): string | undefined {
	if (data.title === undefined) return undefined;
	if (!data.titleTemplate) return data.title;
	return data.titleTemplate.replace('%s', data.title);
}

/**
 * Makes a URL absolute against `baseUrl`.
 *
 * Open Graph images and canonical URLs must be absolute; a relative one is
 * either ignored by unfurlers or resolved against the wrong origin.
 */
function absolute(value: string | undefined, baseUrl: string | undefined): string | undefined {
	if (!value) return value;
	if (!baseUrl) return value;
	if (/^[a-z][a-z0-9+.-]*:/i.test(value) || value.startsWith('//')) return value;
	return `${baseUrl.replace(/\/$/, '')}/${value.replace(/^\//, '')}`;
}

/**
 * Turns merged SEO data into the tags to render.
 *
 * Fallbacks run here rather than at the call site, so a page setting only
 * `title` and `description` still produces a complete Open Graph and Twitter
 * card. Each tag carries a stable `key`, and no key is emitted twice — which
 * is what makes "exactly one `<meta name='description'>`" testable.
 *
 * @param data - Already-merged SEO data
 * @returns The tags, in a stable order
 *
 * @internal
 */
export function buildTags(data: SeoData): readonly SeoTag[] {
	const tags: SeoTag[] = [];
	const seen = new Set<string>();

	/** Adds a tag, ignoring empty values and refusing duplicate keys. */
	const add = (tag: SeoTag | null) => {
		if (!tag || !tag.content) return;
		if (seen.has(tag.key)) return;
		seen.add(tag.key);
		tags.push(tag);
	};

	const { baseUrl } = data;
	const title = resolveTitle(data);
	const canonical = absolute(data.canonical, baseUrl);

	const og = data.og ?? {};
	const twitter = data.twitter ?? {};

	const ogTitle = og.title ?? title;
	const ogDescription = og.description ?? data.description;
	const ogImage = absolute(og.image, baseUrl);
	const ogUrl = absolute(og.url, baseUrl) ?? canonical;

	if (data.description) {
		add({ key: 'description', name: 'description', content: data.description });
	}
	if (data.keywords?.length) {
		add({ key: 'keywords', name: 'keywords', content: data.keywords.join(', ') });
	}
	if (data.robots) add({ key: 'robots', name: 'robots', content: data.robots });
	if (canonical) add({ key: 'canonical', rel: 'canonical', content: canonical });

	if (ogTitle) add({ key: 'og:title', property: 'og:title', content: ogTitle });
	if (ogDescription) {
		add({ key: 'og:description', property: 'og:description', content: ogDescription });
	}
	if (og.type) add({ key: 'og:type', property: 'og:type', content: og.type });
	if (ogUrl) add({ key: 'og:url', property: 'og:url', content: ogUrl });
	if (ogImage) add({ key: 'og:image', property: 'og:image', content: ogImage });
	if (og.imageAlt) {
		add({ key: 'og:image:alt', property: 'og:image:alt', content: og.imageAlt });
	}
	// Dimensions let Facebook and LinkedIn lay the card out immediately. Without
	// them the crawler has to fetch and measure the image first, so the *first*
	// share of a URL frequently previews with no image at all.
	if (ogImage && og.imageWidth !== undefined) {
		add({
			key: 'og:image:width',
			property: 'og:image:width',
			content: String(og.imageWidth)
		});
	}
	if (ogImage && og.imageHeight !== undefined) {
		add({
			key: 'og:image:height',
			property: 'og:image:height',
			content: String(og.imageHeight)
		});
	}
	if (ogImage && og.imageType) {
		add({ key: 'og:image:type', property: 'og:image:type', content: og.imageType });
	}
	if (og.siteName) {
		add({ key: 'og:site_name', property: 'og:site_name', content: og.siteName });
	}
	if (og.locale) add({ key: 'og:locale', property: 'og:locale', content: og.locale });

	// `article:*` is only read when the type says the page is an article, so
	// emitting it otherwise would be noise nothing consumes.
	if (og.type === 'article' && data.article) {
		const article = data.article;

		if (article.publishedTime) {
			add({
				key: 'article:published_time',
				property: 'article:published_time',
				content: article.publishedTime
			});
		}
		if (article.modifiedTime) {
			add({
				key: 'article:modified_time',
				property: 'article:modified_time',
				content: article.modifiedTime
			});
		}
		if (article.expirationTime) {
			add({
				key: 'article:expiration_time',
				property: 'article:expiration_time',
				content: article.expirationTime
			});
		}
		if (article.author) {
			add({ key: 'article:author', property: 'article:author', content: article.author });
		}
		// The Open Graph equivalent of a category. There is no `og:category`.
		if (article.section) {
			add({ key: 'article:section', property: 'article:section', content: article.section });
		}
		// Repeated deliberately — the spec expects one `article:tag` per tag,
		// not a joined list. The index keeps each `key` unique so the duplicate
		// guard above does not collapse them into one.
		article.tags?.forEach((tag, index) => {
			add({ key: `article:tag:${index}`, property: 'article:tag', content: tag });
		});
	}

	// Twitter tags use `name`, not `property` — a common mix-up, and the
	// reason `SeoTag` distinguishes the two rather than emitting one shape.
	if (twitter.card) add({ key: 'twitter:card', name: 'twitter:card', content: twitter.card });
	if (twitter.site) add({ key: 'twitter:site', name: 'twitter:site', content: twitter.site });
	if (twitter.creator) {
		add({ key: 'twitter:creator', name: 'twitter:creator', content: twitter.creator });
	}

	const twitterTitle = twitter.title ?? ogTitle;
	const twitterDescription = twitter.description ?? ogDescription;
	const twitterImage = absolute(twitter.image, baseUrl) ?? ogImage;
	const twitterImageAlt = twitter.imageAlt ?? og.imageAlt;

	if (twitterTitle) add({ key: 'twitter:title', name: 'twitter:title', content: twitterTitle });
	if (twitterDescription) {
		add({ key: 'twitter:description', name: 'twitter:description', content: twitterDescription });
	}
	if (twitterImage) add({ key: 'twitter:image', name: 'twitter:image', content: twitterImage });
	if (twitterImageAlt) {
		add({ key: 'twitter:image:alt', name: 'twitter:image:alt', content: twitterImageAlt });
	}

	return tags;
}

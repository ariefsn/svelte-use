/**
 * Open Graph metadata, used by link unfurlers.
 *
 * Anything omitted falls back to the top-level equivalent, so a page that only
 * sets `title` and `description` still produces a complete card.
 */
export interface SeoOpenGraph {
	/** Falls back to the resolved `title`. */
	title?: string;
	/** Falls back to the top-level `description`. */
	description?: string;
	/** `website`, `article`, `profile`, and so on. */
	type?: string;
	/** Falls back to `canonical`. */
	url?: string;
	/**
	 * The preview image. Must be absolute once rendered — a relative value is
	 * resolved against `baseUrl`.
	 *
	 * Use a **raster** format: Facebook, X, LinkedIn and WhatsApp do not render
	 * SVG previews, so an `.svg` here shows as a card with no image at all.
	 */
	image?: string;
	/** Alternative text for the image. */
	imageAlt?: string;
	/**
	 * Image width in pixels.
	 *
	 * Worth setting: without dimensions Facebook and LinkedIn have to fetch and
	 * measure the image before they can lay the card out, so the *first* share
	 * of a URL often previews with no image at all. 1200×630 is the usual size.
	 */
	imageWidth?: number;
	/** Image height in pixels. See {@link SeoOpenGraph.imageWidth}. */
	imageHeight?: number;
	/** Image MIME type, e.g. `image/png`. */
	imageType?: string;
	/** The site's name, e.g. `Svelte Use`. */
	siteName?: string;
	/** Locale tag, e.g. `en_GB`. */
	locale?: string;
}

/**
 * Article metadata, read by Facebook and LinkedIn when `og.type` is
 * `'article'`. Ignored for other types.
 */
export interface SeoArticle {
	/** ISO 8601 publication time, e.g. `'2026-09-28T10:00:00Z'`. */
	publishedTime?: string;
	/** ISO 8601 time of the last substantive edit. */
	modifiedTime?: string;
	/** ISO 8601 expiry time. */
	expirationTime?: string;
	/** Author name, or a URL to an author profile. */
	author?: string;
	/** High-level section, e.g. `'Documentation'`. */
	section?: string;
	/** Tags. Emitted as one repeated `article:tag` per entry. */
	tags?: readonly string[];
}

/** Twitter card metadata. Falls back to the Open Graph values. */
export interface SeoTwitter {
	card?: 'summary' | 'summary_large_image' | 'app' | 'player';
	/** The site's `@handle`. */
	site?: string;
	/** The author's `@handle`. */
	creator?: string;
	/** Falls back to `og.title`, then the resolved `title`. */
	title?: string;
	/** Falls back to `og.description`, then `description`. */
	description?: string;
	/** Falls back to `og.image`. */
	image?: string;
	imageAlt?: string;
}

/**
 * The metadata for a page.
 *
 * **Every value must be plain, serialisable data.** A page's override usually
 * arrives through `page.data.seo` from a server `load`, which crosses devalue
 * serialisation — so a function would not survive the trip. That is why
 * `titleTemplate` is a string with a `%s` placeholder rather than a callback,
 * which is the one place this diverges from `useTitle`.
 */
export interface SeoData {
	/** The page title. */
	title?: string;
	/**
	 * Wraps `title`, with `%s` replaced by it — e.g. `'%s — Svelte Use'`.
	 *
	 * Ignored when there is no `title`, so a layout default does not produce a
	 * stray `' — Svelte Use'` on a page that sets none.
	 */
	titleTemplate?: string;
	/** The page description. */
	description?: string;
	/** Canonical URL. Relative values are resolved against `baseUrl`. */
	canonical?: string;
	/**
	 * Absolute site origin, e.g. `'https://example.com'`.
	 *
	 * Required for correct output when prerendering: SvelteKit reports
	 * `page.url.origin` as `http://sveltekit-prerender` during a build, so
	 * anything derived from it leaks that placeholder into the shipped HTML.
	 * Open Graph images in particular **must** be absolute or unfurlers ignore
	 * them.
	 */
	baseUrl?: string;
	/** Keywords. Rendered as a single comma-separated tag. */
	keywords?: readonly string[];
	/** Robots directives, e.g. `'noindex, nofollow'`. */
	robots?: string;
	/** Open Graph section. */
	og?: SeoOpenGraph;
	/**
	 * Article metadata. Only meaningful when `og.type` is `'article'`, and
	 * skipped entirely otherwise rather than emitting tags nothing reads.
	 */
	article?: SeoArticle;
	/** Twitter card section. */
	twitter?: SeoTwitter;
}

/**
 * One rendered tag.
 *
 * `key` is both the `{#each}` key and the merge identity, which is what makes
 * "exactly one `<meta name="description">`" a property the tag builder can be
 * tested for rather than something to hope about.
 */
export interface SeoTag {
	/** Stable identity, e.g. `'description'` or `'og:image'`. */
	readonly key: string;
	/** Emits `<meta name=…>`. */
	readonly name?: string;
	/** Emits `<meta property=…>`. */
	readonly property?: string;
	/** Emits `<link rel=…>`. */
	readonly rel?: string;
	/** The tag's value. */
	readonly content: string;
}

import { describe, expect, it } from 'vitest';
import { buildTags, resolveTitle } from './buildTags.js';
import type { SeoTag } from '../types.js';

/** The content of one tag, by key. */
const contentOf = (tags: readonly SeoTag[], key: string) =>
	tags.find((t) => t.key === key)?.content;

describe('resolveTitle', () => {
	it('applies the template', () => {
		expect(resolveTitle({ title: 'Docs', titleTemplate: '%s — Svelte Use' })).toBe(
			'Docs — Svelte Use'
		);
	});

	it('returns the bare title when there is no template', () => {
		expect(resolveTitle({ title: 'Docs' })).toBe('Docs');
	});

	it('is undefined when there is no title, so a template alone emits nothing', () => {
		// Otherwise a page with no title would render a stray ' — Svelte Use'.
		expect(resolveTitle({ titleTemplate: '%s — Svelte Use' })).toBeUndefined();
	});
});

describe('buildTags', () => {
	it('emits exactly one description tag', () => {
		const tags = buildTags({ description: 'A description' });
		expect(tags.filter((t) => t.key === 'description')).toHaveLength(1);
	});

	it('gives every tag a unique key', () => {
		const tags = buildTags({
			title: 'Docs',
			description: 'd',
			canonical: '/docs',
			og: { type: 'article', image: '/logo.svg', siteName: 'Svelte Use' },
			twitter: { card: 'summary' }
		});

		const keys = tags.map((t) => t.key);
		expect(new Set(keys).size).toBe(keys.length);
	});

	it('falls back from og to the top-level values', () => {
		const tags = buildTags({
			title: 'Docs',
			titleTemplate: '%s — Svelte Use',
			description: 'A description'
		});

		expect(contentOf(tags, 'og:title')).toBe('Docs — Svelte Use');
		expect(contentOf(tags, 'og:description')).toBe('A description');
	});

	it('falls back from twitter to og, then to the top level', () => {
		const tags = buildTags({
			title: 'Docs',
			description: 'top',
			og: { description: 'og level', image: '/og.png' },
			twitter: { card: 'summary' }
		});

		expect(contentOf(tags, 'twitter:title')).toBe('Docs');
		expect(contentOf(tags, 'twitter:description')).toBe('og level');
		expect(contentOf(tags, 'twitter:image')).toBe('/og.png');
	});

	it('prefers an explicit twitter value over the og fallback', () => {
		const tags = buildTags({
			og: { title: 'og title' },
			twitter: { title: 'twitter title' }
		});
		expect(contentOf(tags, 'twitter:title')).toBe('twitter title');
	});

	it('resolves relative URLs against baseUrl', () => {
		// The live bug this fixes: without an absolute origin, a build emits
		// og:image="http://sveltekit-prerender/logo.svg".
		const tags = buildTags({
			baseUrl: 'https://svelte-use.ariefsn.dev',
			canonical: '/docs/use-seo',
			og: { image: '/logo.svg' }
		});

		expect(contentOf(tags, 'canonical')).toBe('https://svelte-use.ariefsn.dev/docs/use-seo');
		expect(contentOf(tags, 'og:image')).toBe('https://svelte-use.ariefsn.dev/logo.svg');
	});

	it('leaves already-absolute URLs alone', () => {
		const tags = buildTags({
			baseUrl: 'https://example.com',
			og: { image: 'https://cdn.example.com/a.png', url: '//protocol-relative.test/x' }
		});

		expect(contentOf(tags, 'og:image')).toBe('https://cdn.example.com/a.png');
		expect(contentOf(tags, 'og:url')).toBe('//protocol-relative.test/x');
	});

	it('does not double a slash when baseUrl has a trailing one', () => {
		const tags = buildTags({ baseUrl: 'https://example.com/', canonical: '/docs' });
		expect(contentOf(tags, 'canonical')).toBe('https://example.com/docs');
	});

	it('falls back og:url to canonical', () => {
		const tags = buildTags({ baseUrl: 'https://example.com', canonical: '/docs' });
		expect(contentOf(tags, 'og:url')).toBe('https://example.com/docs');
	});

	it('emits keywords as one comma-separated tag', () => {
		const tags = buildTags({ keywords: ['svelte', 'runes', 'utilities'] });
		expect(contentOf(tags, 'keywords')).toBe('svelte, runes, utilities');
	});

	it('uses name for twitter tags and property for og tags', () => {
		// A common mix-up: Twitter reads `name`, Open Graph reads `property`.
		const tags = buildTags({
			og: { title: 'og' },
			twitter: { card: 'summary' }
		});

		expect(tags.find((t) => t.key === 'og:title')?.property).toBe('og:title');
		expect(tags.find((t) => t.key === 'og:title')?.name).toBeUndefined();
		expect(tags.find((t) => t.key === 'twitter:card')?.name).toBe('twitter:card');
		expect(tags.find((t) => t.key === 'twitter:card')?.property).toBeUndefined();
	});

	it('emits canonical as a link, not a meta', () => {
		const tags = buildTags({ canonical: 'https://example.com/docs' });
		expect(tags.find((t) => t.key === 'canonical')?.rel).toBe('canonical');
	});

	it('emits nothing for empty data', () => {
		expect(buildTags({})).toEqual([]);
	});

	it('skips empty strings rather than emitting blank tags', () => {
		expect(buildTags({ description: '', robots: '' })).toEqual([]);
	});
});

describe('buildTags — image dimensions', () => {
	it('emits width, height and type alongside the image', () => {
		const tags = buildTags({
			og: { image: '/og.png', imageWidth: 1200, imageHeight: 630, imageType: 'image/png' }
		});

		expect(contentOf(tags, 'og:image:width')).toBe('1200');
		expect(contentOf(tags, 'og:image:height')).toBe('630');
		expect(contentOf(tags, 'og:image:type')).toBe('image/png');
	});

	it('skips dimensions when there is no image to describe', () => {
		const tags = buildTags({ og: { imageWidth: 1200, imageHeight: 630 } });
		expect(tags.find((t) => t.key.startsWith('og:image'))).toBeUndefined();
	});

	it('emits a zero dimension rather than dropping it as falsy', () => {
		// `content` is stringified before the empty-value check, so `0` survives.
		const tags = buildTags({ og: { image: '/og.png', imageWidth: 0 } });
		expect(contentOf(tags, 'og:image:width')).toBe('0');
	});
});

describe('buildTags — article metadata', () => {
	const article = {
		publishedTime: '2026-09-27T10:00:00Z',
		modifiedTime: '2026-09-27T12:00:00Z',
		author: 'Ada Lovelace',
		section: 'Documentation',
		tags: ['svelte', 'runes']
	};

	it('emits article tags when the type is article', () => {
		const tags = buildTags({ og: { type: 'article' }, article });

		expect(contentOf(tags, 'article:published_time')).toBe('2026-09-27T10:00:00Z');
		expect(contentOf(tags, 'article:modified_time')).toBe('2026-09-27T12:00:00Z');
		expect(contentOf(tags, 'article:author')).toBe('Ada Lovelace');
		expect(contentOf(tags, 'article:section')).toBe('Documentation');
	});

	it('repeats article:tag once per tag rather than joining them', () => {
		// The spec expects repeated properties; a comma-joined list is not read
		// as multiple tags.
		const tags = buildTags({ og: { type: 'article' }, article });
		const tagged = tags.filter((t) => t.property === 'article:tag');

		expect(tagged.map((t) => t.content)).toEqual(['svelte', 'runes']);
		// Distinct keys, or the duplicate guard would collapse them into one.
		expect(new Set(tagged.map((t) => t.key)).size).toBe(2);
	});

	it('skips article tags entirely when the type is not article', () => {
		const tags = buildTags({ og: { type: 'website' }, article });
		expect(tags.filter((t) => t.key.startsWith('article:'))).toEqual([]);
	});

	it('skips them when og.type is absent', () => {
		const tags = buildTags({ article });
		expect(tags.filter((t) => t.key.startsWith('article:'))).toEqual([]);
	});
});

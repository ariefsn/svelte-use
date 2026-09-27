import { afterEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Seo from './Seo.svelte';
import type { SeoData } from './types.js';

/** Reads a rendered tag's content out of the live document head. */
function meta(selector: string): string | null {
	return document.head.querySelector(selector)?.getAttribute('content') ?? null;
}

const originalTitle = document.title;

describe('Seo.svelte', () => {
	// Unmounting removes the meta tags but leaves `document.title` as the last
	// value written, so it is restored by hand rather than relying on cleanup.
	afterEach(() => {
		document.title = originalTitle;
	});

	test('renders the title into the document head', () => {
		render(Seo, { props: { data: { title: 'Docs' } satisfies SeoData } });
		expect(document.title).toBe('Docs');
	});

	test('applies titleTemplate', () => {
		render(Seo, {
			props: { data: { title: 'useSeo', titleTemplate: '%s — Svelte Use' } satisfies SeoData }
		});
		expect(document.title).toBe('useSeo — Svelte Use');
	});

	test('renders no title element when there is no title', () => {
		document.title = 'Untouched';
		render(Seo, { props: { data: { description: 'No title here' } satisfies SeoData } });
		expect(document.title).toBe('Untouched');
	});

	test('renders a name-based meta tag', () => {
		render(Seo, { props: { data: { description: 'A library' } satisfies SeoData } });
		expect(meta('meta[name="description"]')).toBe('A library');
	});

	test('renders a property-based meta tag for Open Graph', () => {
		render(Seo, {
			props: { data: { title: 'Docs', og: { type: 'website' } } satisfies SeoData }
		});
		expect(meta('meta[property="og:type"]')).toBe('website');
		expect(meta('meta[property="og:title"]')).toBe('Docs');
	});

	test('renders a link tag for the canonical url', () => {
		render(Seo, {
			props: { data: { canonical: 'https://example.com/docs' } satisfies SeoData }
		});
		const link = document.head.querySelector('link[rel="canonical"]');
		expect(link?.getAttribute('href')).toBe('https://example.com/docs');
	});

	test('uses name, not property, for twitter tags', () => {
		render(Seo, {
			props: { data: { twitter: { card: 'summary_large_image' } } satisfies SeoData }
		});
		expect(meta('meta[name="twitter:card"]')).toBe('summary_large_image');
		expect(document.head.querySelector('meta[property="twitter:card"]')).toBeNull();
	});

	test('renders one article:tag element per tag', () => {
		render(Seo, {
			props: {
				data: {
					og: { type: 'article' },
					article: { tags: ['svelte', 'runes', 'seo'] }
				} satisfies SeoData
			}
		});
		expect(document.head.querySelectorAll('meta[property="article:tag"]')).toHaveLength(3);
	});

	test('resolves relative urls against baseUrl', () => {
		render(Seo, {
			props: {
				data: { baseUrl: 'https://example.com', og: { image: '/og.png' } } satisfies SeoData
			}
		});
		expect(meta('meta[property="og:image"]')).toBe('https://example.com/og.png');
	});

	test('emits nothing for empty data', () => {
		const before = document.head.querySelectorAll('meta, link[rel="canonical"]').length;
		render(Seo, { props: { data: {} satisfies SeoData } });
		expect(document.head.querySelectorAll('meta, link[rel="canonical"]').length).toBe(before);
	});

	test('updates the head when the data prop changes', async () => {
		const screen = render(Seo, { props: { data: { title: 'First' } satisfies SeoData } });
		expect(document.title).toBe('First');

		await screen.rerender({ data: { title: 'Second', description: 'Added' } satisfies SeoData });
		expect(document.title).toBe('Second');
		expect(meta('meta[name="description"]')).toBe('Added');
	});
});

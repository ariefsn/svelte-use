import { describe, expect, test } from 'vitest';
import { render } from 'svelte/server';
import Seo from './Seo.svelte';
import type { SeoData } from './types.js';

/*
 * Runs in the `server` project. The whole point of `<Seo />` is that its tags land
 * in the server-rendered HTML, where crawlers and link unfurlers can see them —
 * a client-only assertion would not prove that.
 */
function head(data: SeoData): string {
	return render(Seo, { props: { data } }).head;
}

describe('Seo.svelte during SSR', () => {
	test('emits the title into the rendered head', () => {
		expect(head({ title: 'Docs' })).toContain('<title>Docs</title>');
	});

	test('applies titleTemplate', () => {
		expect(head({ title: 'useSeo', titleTemplate: '%s — Svelte Use' })).toContain(
			'<title>useSeo — Svelte Use</title>'
		);
	});

	test('emits no title element when there is no title', () => {
		expect(head({ description: 'No title' })).not.toContain('<title>');
	});

	test('emits a name-based meta tag', () => {
		expect(head({ description: 'A library' })).toContain('name="description"');
	});

	test('emits a property-based meta tag for Open Graph', () => {
		const out = head({ title: 'Docs', og: { type: 'website' } });
		expect(out).toContain('property="og:type"');
		expect(out).toContain('property="og:title"');
	});

	test('emits a link tag for the canonical url', () => {
		const out = head({ canonical: 'https://example.com/docs' });
		expect(out).toContain('rel="canonical"');
		expect(out).toContain('https://example.com/docs');
	});

	test('uses name, not property, for twitter tags', () => {
		const out = head({ twitter: { card: 'summary_large_image' } });
		expect(out).toContain('name="twitter:card"');
		expect(out).not.toContain('property="twitter:card"');
	});

	test('emits one article:tag element per tag', () => {
		const out = head({ og: { type: 'article' }, article: { tags: ['svelte', 'runes', 'seo'] } });
		expect(out.match(/property="article:tag"/g)).toHaveLength(3);
	});

	test('resolves relative urls against baseUrl', () => {
		expect(head({ baseUrl: 'https://example.com', og: { image: '/og.png' } })).toContain(
			'https://example.com/og.png'
		);
	});

	test('emits nothing for empty data', () => {
		const out = head({});
		expect(out).not.toContain('<meta');
		expect(out).not.toContain('<link');
	});
});

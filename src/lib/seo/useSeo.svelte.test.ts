import { flushSync } from 'svelte';
import { describe, expect, test } from 'vitest';
import { useSeo, type SeoLayer } from './useSeo.svelte.js';
import type { SeoData, SeoTag } from './types.js';

/** Constructs inside a root, since `useSeo` builds `$derived` values. */
function harness(...layers: SeoLayer[]) {
	let api!: ReturnType<typeof useSeo>;
	const stop = $effect.root(() => {
		api = useSeo(...layers);
	});
	flushSync();
	return { api, stop };
}

/** Looks a rendered tag up by its stable key. */
function byKey(tags: readonly SeoTag[], key: string): SeoTag | undefined {
	return tags.find((t) => t.key === key);
}

describe('useSeo', () => {
	test('with no layers the data is empty and there are no tags', () => {
		const { api, stop } = harness();
		expect(api.data()).toEqual({});
		expect(api.title()).toBeUndefined();
		expect(api.tags()).toEqual([]);
		stop();
	});

	test('accepts a plain object layer', () => {
		const { api, stop } = harness({ title: 'Docs', description: 'A library' });
		expect(api.title()).toBe('Docs');
		expect(byKey(api.tags(), 'description')?.content).toBe('A library');
		stop();
	});

	test('accepts a getter layer', () => {
		const { api, stop } = harness(() => ({ title: 'From getter' }));
		expect(api.title()).toBe('From getter');
		stop();
	});

	test('later layers win per key, not wholesale', () => {
		const { api, stop } = harness(
			{ title: 'Base', description: 'Base description', og: { siteName: 'Svelte Use' } },
			{ title: 'Page' }
		);
		expect(api.title()).toBe('Page');
		expect(api.data().description).toBe('Base description');
		expect(byKey(api.tags(), 'og:site_name')?.content).toBe('Svelte Use');
		stop();
	});

	test('skips null and undefined layers', () => {
		const { api, stop } = harness({ title: 'Kept' }, null, undefined, () => null);
		expect(api.title()).toBe('Kept');
		stop();
	});

	test('applies titleTemplate to the resolved title', () => {
		const { api, stop } = harness({ titleTemplate: '%s — Svelte Use' }, { title: 'useSeo' });
		expect(api.title()).toBe('useSeo — Svelte Use');
		expect(byKey(api.tags(), 'og:title')?.content).toBe('useSeo — Svelte Use');
		stop();
	});

	test('a titleTemplate with no title resolves to nothing', () => {
		const { api, stop } = harness({ titleTemplate: '%s — Svelte Use' });
		expect(api.title()).toBeUndefined();
		stop();
	});

	test('every tag carries a stable, unique key', () => {
		const { api, stop } = harness({
			title: 'Docs',
			description: 'A library',
			keywords: ['svelte', 'runes'],
			robots: 'index,follow',
			canonical: '/docs',
			baseUrl: 'https://example.com',
			og: { type: 'website', image: '/og.png', siteName: 'Svelte Use' },
			twitter: { card: 'summary_large_image', site: '@handle' }
		});
		const keys = api.tags().map((t) => t.key);
		expect(keys.length).toBeGreaterThan(5);
		expect(new Set(keys).size).toBe(keys.length);
		stop();
	});

	test('distinguishes link, property and name tags', () => {
		const { api, stop } = harness({
			title: 'Docs',
			description: 'A library',
			canonical: 'https://example.com/docs',
			og: { type: 'website' },
			twitter: { card: 'summary' }
		});
		expect(byKey(api.tags(), 'canonical')?.rel).toBe('canonical');
		expect(byKey(api.tags(), 'og:type')?.property).toBe('og:type');
		expect(byKey(api.tags(), 'twitter:card')?.name).toBe('twitter:card');
		expect(byKey(api.tags(), 'description')?.name).toBe('description');
		stop();
	});

	test('resolves relative urls against baseUrl', () => {
		const { api, stop } = harness({
			baseUrl: 'https://example.com/',
			canonical: '/docs/use-seo',
			og: { image: '/og.png' }
		});
		expect(byKey(api.tags(), 'canonical')?.content).toBe('https://example.com/docs/use-seo');
		expect(byKey(api.tags(), 'og:image')?.content).toBe('https://example.com/og.png');
		stop();
	});

	test('leaves an already absolute url alone', () => {
		const { api, stop } = harness({
			baseUrl: 'https://example.com',
			og: { image: 'https://cdn.example.net/og.png' }
		});
		expect(byKey(api.tags(), 'og:image')?.content).toBe('https://cdn.example.net/og.png');
		stop();
	});

	test('recomputes when a reactive layer changes', () => {
		let override = $state<SeoData | null>(null);
		let api!: ReturnType<typeof useSeo>;
		const stop = $effect.root(() => {
			api = useSeo({ title: 'Base', description: 'Base description' }, () => override);
		});
		flushSync();
		expect(api.title()).toBe('Base');

		override = { title: 'Updated' };
		flushSync();
		expect(api.title()).toBe('Updated');
		expect(api.data().description).toBe('Base description');
		expect(byKey(api.tags(), 'og:title')?.content).toBe('Updated');

		override = null;
		flushSync();
		expect(api.title()).toBe('Base');
		stop();
	});

	test('emits article tags only when the page is an article', () => {
		const article = { author: 'Ada Lovelace', section: 'Docs', tags: ['svelte', 'seo'] };
		const asArticle = harness({ og: { type: 'article' }, article });
		expect(byKey(asArticle.api.tags(), 'article:author')?.content).toBe('Ada Lovelace');
		expect(asArticle.api.tags().filter((t) => t.property === 'article:tag')).toHaveLength(2);
		asArticle.stop();

		const asWebsite = harness({ og: { type: 'website' }, article });
		expect(byKey(asWebsite.api.tags(), 'article:author')).toBeUndefined();
		asWebsite.stop();
	});

	test('falls back from twitter to og values', () => {
		const { api, stop } = harness({
			title: 'Docs',
			description: 'A library',
			og: { image: 'https://example.com/og.png', imageAlt: 'Preview' },
			twitter: { card: 'summary' }
		});
		expect(byKey(api.tags(), 'twitter:title')?.content).toBe('Docs');
		expect(byKey(api.tags(), 'twitter:description')?.content).toBe('A library');
		expect(byKey(api.tags(), 'twitter:image')?.content).toBe('https://example.com/og.png');
		expect(byKey(api.tags(), 'twitter:image:alt')?.content).toBe('Preview');
		stop();
	});
});

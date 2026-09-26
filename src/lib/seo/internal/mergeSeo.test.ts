import { describe, expect, it } from 'vitest';
import { mergeSeo } from './mergeSeo.js';

describe('mergeSeo', () => {
	it('lets a later layer override an earlier one', () => {
		const merged = mergeSeo([{ title: 'Default' }, { title: 'Page' }]);
		expect(merged.title).toBe('Page');
	});

	it('keeps earlier values a later layer does not mention', () => {
		const merged = mergeSeo([
			{ title: 'Default', description: 'Site description' },
			{ title: 'Page' }
		]);
		expect(merged.description).toBe('Site description');
	});

	it('merges og per key rather than replacing the section', () => {
		// The bug this exists to prevent: a page setting only og.type must not
		// wipe the layout's siteName and image, which would silently produce a
		// worse link preview than the defaults alone.
		const merged = mergeSeo([
			{ og: { siteName: 'Svelte Use', image: '/logo.svg', type: 'website' } },
			{ og: { type: 'article' } }
		]);

		expect(merged.og).toEqual({ siteName: 'Svelte Use', image: '/logo.svg', type: 'article' });
	});

	it('merges twitter per key too', () => {
		const merged = mergeSeo([
			{ twitter: { card: 'summary', site: '@ariefsn' } },
			{ twitter: { title: 'Page' } }
		]);

		expect(merged.twitter).toEqual({ card: 'summary', site: '@ariefsn', title: 'Page' });
	});

	it('treats undefined as "not specified", not "clear it"', () => {
		const merged = mergeSeo([
			{ title: 'Default', og: { siteName: 'Svelte Use' } },
			{ title: undefined, og: { siteName: undefined, type: 'article' } }
		]);

		expect(merged.title).toBe('Default');
		expect(merged.og).toEqual({ siteName: 'Svelte Use', type: 'article' });
	});

	it('skips null and undefined layers', () => {
		const merged = mergeSeo([{ title: 'Default' }, null, undefined, { description: 'd' }]);
		expect(merged).toEqual({ title: 'Default', description: 'd' });
	});

	it('does not mutate the input layers', () => {
		const base = { og: { siteName: 'Svelte Use' } };
		const patch = { og: { type: 'article' } };

		mergeSeo([base, patch]);

		expect(base.og).toEqual({ siteName: 'Svelte Use' });
		expect(patch.og).toEqual({ type: 'article' });
	});

	it('returns an empty object for no layers', () => {
		expect(mergeSeo([])).toEqual({});
	});

	it('merges article per key, like og and twitter', () => {
		const merged = mergeSeo([
			{ article: { author: 'Ada Lovelace', section: 'Documentation' } },
			{ article: { publishedTime: '2026-09-28T10:00:00Z' } }
		]);

		expect(merged.article).toEqual({
			author: 'Ada Lovelace',
			section: 'Documentation',
			publishedTime: '2026-09-28T10:00:00Z'
		});
	});

	it('replaces article tags wholesale rather than concatenating', () => {
		// An array is a value, not a section: a page listing its own tags means
		// exactly those, not those plus the layout's.
		const merged = mergeSeo([
			{ article: { tags: ['site-wide'] } },
			{ article: { tags: ['svelte', 'runes'] } }
		]);

		expect(merged.article?.tags).toEqual(['svelte', 'runes']);
	});

	it('handles a layer adding a section the base lacks', () => {
		const merged = mergeSeo([{ title: 'T' }, { og: { type: 'article' } }]);
		expect(merged.og).toEqual({ type: 'article' });
	});
});

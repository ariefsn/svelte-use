import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { pages } from './pages.js';
import { NEW_IN_VERSION, allSlugs, groupHasNew, isNew, sidebar } from './sidebar.js';

const DEMOS_DIR = join(process.cwd(), 'src/routes/docs/[slug]/demos');

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

/**
 * Three touchpoints have no compile-time link to the sidebar and so rot
 * silently: a util can ship with no `demoMap` entry (caught only by
 * `bun run build`), no barrel export (caught by nothing), and no README row
 * (caught by nothing). Reading the three files as text is crude, but it
 * catches "forgot entirely", which is the failure mode that actually happens.
 */
const PAGE_SVELTE = read('src/routes/docs/[slug]/+page.svelte');
const INDEX_TS = read('src/lib/index.ts');
const README = read('README.md');

const labels = sidebar.flatMap((group) => group.items.map((item) => item.label));

/**
 * The docs site is assembled from four places that must agree: the sidebar,
 * the page content, the demo components, and the demo registry in
 * `+page.svelte`. Nothing links them at compile time, so a util added to one
 * and forgotten in another only shows up as a 404 or a missing demo in the
 * browser. These checks fail the build instead.
 */
describe('docs coverage', () => {
	it('every sidebar slug has a pages.ts entry', () => {
		expect(allSlugs.filter((slug) => !(slug in pages))).toEqual([]);
	});

	it('every pages.ts entry appears in the sidebar', () => {
		expect(Object.keys(pages).filter((slug) => !allSlugs.includes(slug))).toEqual([]);
	});

	it('every page key matches its own slug field', () => {
		const mismatched = Object.entries(pages)
			.filter(([key, page]) => key !== page.slug)
			.map(([key, page]) => `${key} → ${page.slug}`);
		expect(mismatched).toEqual([]);
	});

	it('every sidebar slug has a demo component on disk', () => {
		const missing = allSlugs.filter((slug) => !existsSync(join(DEMOS_DIR, `${slug}.svelte`)));
		expect(missing).toEqual([]);
	});

	it('has no duplicate slugs across sidebar groups', () => {
		const seen = new Set<string>();
		const duplicates = allSlugs.filter((slug) => !seen.add(slug));
		expect(duplicates).toEqual([]);
	});

	it('every sidebar group has a title and at least one item', () => {
		const empty = sidebar.filter((group) => !group.title || group.items.length === 0);
		expect(empty).toEqual([]);
	});

	it('every item records the version it shipped in', () => {
		// The docs page renders `since` as a badge next to the title. A missing
		// one silently rendered nothing, which read as "this util has no
		// history" rather than "someone forgot".
		const missing = sidebar
			.flatMap((group) => group.items)
			.filter((item) => !item.since)
			.map((item) => item.slug);
		expect(missing).toEqual([]);
	});

	it('every `since` is a valid semver-ish version', () => {
		const malformed = sidebar
			.flatMap((group) => group.items)
			.filter((item) => !/^\d+\.\d+\.\d+$/.test(item.since))
			.map((item) => `${item.slug} → ${item.since}`);
		expect(malformed).toEqual([]);
	});

	it('no `since` is newer than the release being highlighted', () => {
		// Catches a typo like `since: '1.3.0'` while NEW_IN_VERSION is 1.2.0 —
		// which would badge a util as shipped in a release that does not exist.
		const order = (v: string) => v.split('.').map(Number);
		const newer = sidebar
			.flatMap((group) => group.items)
			.filter((item) => {
				const [a, b, c] = order(item.since);
				const [x, y, z] = order(NEW_IN_VERSION);
				return a > x || (a === x && (b > y || (b === y && c > z)));
			})
			.map((item) => `${item.slug} → ${item.since}`);
		expect(newer).toEqual([]);
	});

	it('NEW_IN_VERSION matches the version in package.json', () => {
		// Otherwise the badges silently vanish (or linger) after a release bump.
		const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));
		expect(NEW_IN_VERSION).toBe(pkg.version);
	});

	it('groupHasNew is true exactly for groups containing a new item', () => {
		for (const group of sidebar) {
			expect(groupHasNew(group)).toBe(group.items.some(isNew));
		}
	});

	it('every new item is reachable through a group flagged as having new items', () => {
		// Guards the collapsed-group case: a new util whose group is not
		// flagged would be invisible until the user expanded it at random.
		const unreachable = sidebar
			.filter((group) => group.items.some(isNew) && !groupHasNew(group))
			.map((group) => group.title);
		expect(unreachable).toEqual([]);
	});

	it('at least one item is badged new', () => {
		// A release with no new-flagged utils usually means the `since` fields
		// were forgotten rather than that nothing was added.
		expect(sidebar.flatMap((g) => g.items).filter(isNew).length).toBeGreaterThan(0);
	});

	it('every sidebar slug is registered in demoMap', () => {
		// `+page.svelte` imports each demo and maps it by slug. A missing entry
		// renders the page with no Live Demo section and is caught only by a
		// full `bun run build`, which is the slowest gate we have.
		//
		// Both quotings are accepted because prettier drops the quotes from a
		// key that is a valid identifier: `'use-seo':` keeps them, `seo:` does
		// not.
		const missing = allSlugs.filter(
			(slug) => !PAGE_SVELTE.includes(`'${slug}':`) && !PAGE_SVELTE.includes(`\n\t\t${slug}:`)
		);
		expect(missing).toEqual([]);
	});

	it('every sidebar entry is exported from src/lib/index.ts', () => {
		// The barrel is the public surface. A util documented but not exported
		// is a doc page for something consumers cannot import.
		const missing = labels.filter((label) => !INDEX_TS.includes(label));
		expect(missing).toEqual([]);
	});

	it('every sidebar entry has a README row', () => {
		const missing = labels.filter((label) => !README.includes(`\`${label}\``));
		expect(missing).toEqual([]);
	});

	it('every page has the fields the template renders', () => {
		const incomplete = Object.values(pages)
			.filter((page) => !page.title || !page.description || !page.usage || !page.example)
			.map((page) => page.slug);
		expect(incomplete).toEqual([]);
	});
});

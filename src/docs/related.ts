import { stripInline } from './format.js';
import { pages, type ApiRow, type DocPage } from './pages.js';
import { allSlugs, sidebar } from './sidebar.js';

/** A related utility, ready to render as a card. */
export interface RelatedLink {
	slug: string;
	label: string;
	/** The sidebar group it belongs to, shown as a kicker. */
	group: string;
	/** One-sentence summary, markers stripped. */
	blurb: string;
}

interface SlugMeta {
	label: string;
	group: string;
	blurb: string;
}

/** How many links a page shows. Four fills two rows of the card grid neatly. */
const MAX_LINKS = 4;

/** First sentence of a description, markers removed, trimmed to a card's worth. */
function toBlurb(description: string): string {
	const plain = stripInline(description);
	const firstSentence = plain.split(/(?<=\.)\s/)[0] ?? plain;
	return firstSentence.length > 110 ? `${firstSentence.slice(0, 107).trimEnd()}…` : firstSentence;
}

/** Every string in a page that could name another utility. */
function searchableText(page: DocPage): string {
	const rows: ApiRow[] = [
		...(page.props ?? []),
		...(page.params ?? []),
		...(page.options ?? []),
		...(page.returns ?? [])
	];
	return [page.description, ...(page.notes ?? []), ...rows.map((row) => row.description)].join(
		'\n'
	);
}

/*
 * Indexes are built once at module load. This module is imported only by
 * `+page.server.ts`, so that happens once per build process rather than per
 * page — and `pages.ts` is 260KB, so it must never reach the client bundle.
 */

const slugMeta = new Map<string, SlugMeta>();
for (const group of sidebar) {
	for (const item of group.items) {
		const page = pages[item.slug];
		slugMeta.set(item.slug, {
			label: item.label,
			group: group.title,
			blurb: page ? toBlurb(page.description) : ''
		});
	}
}

/** label → slug, for resolving a mention back to a page. */
const slugByLabel = new Map<string, string>();
for (const [slug, meta] of slugMeta) slugByLabel.set(meta.label, slug);

/**
 * Whether `text` names `label` as a code span.
 *
 * Delimiters are load-bearing: five labels are prefixes of others
 * (`useTimeout`/`useTimeoutFn`, `useMouse`/`useMouseInElement`,
 * `useScroll`/`useScrollLock`, `useInterval`/`useIntervalFn`,
 * `useDebounce`/`useDebounceFn`), so a bare `includes(label)` would report
 * relationships that do not exist.
 */
function mentions(text: string, label: string): boolean {
	return text.includes(`\`${label}\``) || text.includes(`\`${label}(`);
}

const outgoing = new Map<string, string[]>();
const incoming = new Map<string, string[]>();

for (const [slug, meta] of slugMeta) {
	const page = pages[slug];
	if (!page) continue;

	const text = searchableText(page);
	const found: string[] = [];

	for (const [otherSlug, otherMeta] of slugMeta) {
		if (otherSlug === slug) continue;
		if (!mentions(text, otherMeta.label)) continue;

		found.push(otherSlug);
		const back = incoming.get(otherSlug) ?? [];
		back.push(slug);
		incoming.set(otherSlug, back);
	}

	if (found.length > 0) outgoing.set(slug, found);
	void meta;
}

/** Slugs in the same sidebar group, excluding the page itself. */
function siblings(slug: string): string[] {
	const group = sidebar.find((candidate) => candidate.items.some((item) => item.slug === slug));
	if (!group) return [];
	return group.items.map((item) => item.slug).filter((candidate) => candidate !== slug);
}

/**
 * Related utilities for a page, best first.
 *
 * Ranked: an explicit `related` override, then utilities this page's own prose
 * points at, then ones that point back at it, then same-group siblings. The
 * prose signal comes first because it reflects a relationship someone actually
 * wrote down — and it often crosses groups, which a sibling list cannot.
 *
 * @param slug - The page to find links for
 * @returns Up to four links, or fewer when the library genuinely has no more
 */
export function relatedFor(slug: string): RelatedLink[] {
	const page = pages[slug];
	if (!page) return [];

	const explicit = (page.related ?? []).filter((candidate) => slugMeta.has(candidate));

	// Prev/next already sit in the footer nav, so a sibling that is also a
	// neighbour is kept but sorted last — excluding it outright would empty the
	// block for a middle item of a small group.
	const index = allSlugs.indexOf(slug);
	const neighbours = new Set([allSlugs[index - 1], allSlugs[index + 1]].filter(Boolean));
	const ranked = siblings(slug).sort(
		(a, b) => Number(neighbours.has(a)) - Number(neighbours.has(b))
	);

	const ordered = [
		...explicit,
		...(outgoing.get(slug) ?? []),
		...(incoming.get(slug) ?? []),
		...ranked
	];

	const seen = new Set<string>([slug]);
	const links: RelatedLink[] = [];

	for (const candidate of ordered) {
		if (seen.has(candidate)) continue;
		seen.add(candidate);

		const meta = slugMeta.get(candidate);
		if (!meta) continue;

		links.push({ slug: candidate, label: meta.label, group: meta.group, blurb: meta.blurb });
		if (links.length === MAX_LINKS) break;
	}

	return links;
}

/** Only used by the coverage test, which checks every page produces links. */
export const relatedSlugs = allSlugs;

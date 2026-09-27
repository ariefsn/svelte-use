import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { resetHeadElementRegistry } from './internal/headElement.js';
import { useFavicon } from './useFavicon.svelte.js';

function iconLinks(): HTMLLinkElement[] {
	return [...document.head.querySelectorAll<HTMLLinkElement>('link[rel="icon"]')];
}

/** Adds a favicon the library did not create, to exercise the adopt path. */
function seedExistingIcon(href: string): HTMLLinkElement {
	const link = document.createElement('link');
	link.rel = 'icon';
	link.href = href;
	document.head.appendChild(link);
	return link;
}

beforeEach(() => {
	resetHeadElementRegistry();
	// The test page ships its own favicon; start from a known-empty state.
	for (const link of iconLinks()) link.remove();
});

afterEach(() => {
	resetHeadElementRegistry();
	for (const link of iconLinks()) link.remove();
});

describe('useFavicon', () => {
	test('creates a link when the document has none', () => {
		const cleanup = $effect.root(() => {
			useFavicon('/a.svg');
			flushSync();

			expect(iconLinks()).toHaveLength(1);
			expect(iconLinks()[0].getAttribute('href')).toBe('/a.svg');
		});
		cleanup();
	});

	test('reports the href before any effect runs', () => {
		const cleanup = $effect.root(() => {
			const favicon = useFavicon('/b.svg');
			expect(favicon.current()).toBe('/b.svg');
		});
		cleanup();
	});

	test('infers the type from the file extension', () => {
		const cleanup = $effect.root(() => {
			useFavicon('/c.png');
			flushSync();

			expect(iconLinks()[0].type).toBe('image/png');
		});
		cleanup();
	});

	test('ignores a query string when inferring the type', () => {
		const cleanup = $effect.root(() => {
			useFavicon('/d.svg?v=2');
			flushSync();

			expect(iconLinks()[0].type).toBe('image/svg+xml');
		});
		cleanup();
	});

	test('skips type inference when disabled', () => {
		const cleanup = $effect.root(() => {
			useFavicon('/e.png', { inferType: false });
			flushSync();

			expect(iconLinks()[0].type).toBe('');
		});
		cleanup();
	});

	test('adopts an existing icon rather than appending a second', () => {
		// Browsers pick unpredictably among duplicate icon links.
		const existing = seedExistingIcon('/original.png');

		const cleanup = $effect.root(() => {
			useFavicon('/replacement.svg');
			flushSync();

			expect(iconLinks()).toHaveLength(1);
			expect(iconLinks()[0]).toBe(existing);
			expect(existing.getAttribute('href')).toBe('/replacement.svg');
		});
		cleanup();
	});

	test('follows a reactive href', () => {
		const cleanup = $effect.root(() => {
			let unread = $state(0);
			const favicon = useFavicon(() => (unread > 0 ? '/unread.svg' : '/idle.svg'));
			flushSync();
			expect(favicon.current()).toBe('/idle.svg');

			unread = 3;
			flushSync();
			expect(favicon.current()).toBe('/unread.svg');
			expect(iconLinks()[0].getAttribute('href')).toBe('/unread.svg');
		});
		cleanup();
	});

	test('set() writes the href', () => {
		const cleanup = $effect.root(() => {
			const favicon = useFavicon('/f.svg');
			flushSync();

			favicon.set('/g.svg');
			flushSync();

			expect(favicon.current()).toBe('/g.svg');
			expect(iconLinks()[0].getAttribute('href')).toBe('/g.svg');
		});
		cleanup();
	});

	test('set(null) restores the adopted href', () => {
		seedExistingIcon('/original.png');

		const cleanup = $effect.root(() => {
			const favicon = useFavicon('/temporary.svg');
			flushSync();
			expect(iconLinks()[0].getAttribute('href')).toBe('/temporary.svg');

			favicon.set(null);
			flushSync();

			expect(iconLinks()[0].getAttribute('href')).toBe('/original.png');
		});
		cleanup();
	});

	test('removes a created link on destroy', () => {
		const cleanup = $effect.root(() => {
			useFavicon('/h.svg');
			flushSync();
			expect(iconLinks()).toHaveLength(1);
		});

		cleanup();

		expect(iconLinks()).toHaveLength(0);
	});

	test('restores rather than removes an adopted link on destroy', () => {
		// The registry invariant: this library did not put it there, so it does
		// not take it away.
		const existing = seedExistingIcon('/original.png');

		const cleanup = $effect.root(() => {
			useFavicon('/temporary.svg');
			flushSync();
		});

		cleanup();

		expect(iconLinks()).toHaveLength(1);
		expect(iconLinks()[0]).toBe(existing);
		expect(existing.getAttribute('href')).toBe('/original.png');
	});

	test('leaves the adopted href alone when restoreOnDestroy is false', () => {
		const existing = seedExistingIcon('/original.png');

		const cleanup = $effect.root(() => {
			useFavicon('/kept.svg', { restoreOnDestroy: false });
			flushSync();
		});

		cleanup();

		expect(existing.getAttribute('href')).toBe('/kept.svg');
	});

	test('read-only mode reports the existing icon without changing it', () => {
		const existing = seedExistingIcon('/original.png');

		const cleanup = $effect.root(() => {
			const favicon = useFavicon();
			flushSync();

			expect(favicon.current()).toBe('/original.png');
			expect(existing.getAttribute('href')).toBe('/original.png');
		});
		cleanup();
	});

	test('honours a custom rel', () => {
		const cleanup = $effect.root(() => {
			useFavicon('/i.png', { rel: 'shortcut icon' });
			flushSync();

			const link = document.head.querySelector<HTMLLinkElement>('link[rel="shortcut icon"]');
			expect(link?.getAttribute('href')).toBe('/i.png');
		});
		cleanup();

		for (const link of document.head.querySelectorAll('link[rel="shortcut icon"]')) link.remove();
	});
});

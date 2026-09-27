import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { useTitle } from './useTitle.svelte.js';

let original: string;

beforeEach(() => {
	original = document.title;
	document.title = 'Baseline';
});

afterEach(() => {
	document.title = original;
});

describe('useTitle', () => {
	test('writes the title it is given', () => {
		const cleanup = $effect.root(() => {
			const title = useTitle('Dashboard');
			flushSync();

			expect(document.title).toBe('Dashboard');
			expect(title.current()).toBe('Dashboard');
		});
		cleanup();
	});

	test('resolves the title before any effect runs', () => {
		const cleanup = $effect.root(() => {
			// The SSR-equivalent read: the value is known, nothing is written.
			const title = useTitle('Reports');
			expect(title.current()).toBe('Reports');
		});
		cleanup();
	});

	test('is read-only when called with no argument', () => {
		const cleanup = $effect.root(() => {
			const title = useTitle();
			flushSync();

			expect(title.current()).toBe('Baseline');
			// Must never clobber a title set elsewhere — this is what keeps a
			// display-only consumer from fighting <Seo />.
			expect(document.title).toBe('Baseline');
		});
		cleanup();
	});

	test('follows a reactive source', () => {
		const cleanup = $effect.root(() => {
			let unread = $state(0);
			const title = useTitle(() => (unread > 0 ? `(${unread}) Inbox` : 'Inbox'));
			flushSync();
			expect(document.title).toBe('Inbox');

			unread = 3;
			flushSync();
			expect(document.title).toBe('(3) Inbox');
			expect(title.current()).toBe('(3) Inbox');
		});
		cleanup();
	});

	test('applies the template', () => {
		const cleanup = $effect.root(() => {
			useTitle('Settings', { template: (t) => `${t} — Acme` });
			flushSync();

			expect(document.title).toBe('Settings — Acme');
		});
		cleanup();
	});

	test('applies the template to set() as well', () => {
		const cleanup = $effect.root(() => {
			const title = useTitle('Settings', { template: (t) => `${t} — Acme` });
			flushSync();

			title.set('Billing');
			flushSync();

			// Callers never pre-format.
			expect(document.title).toBe('Billing — Acme');
			expect(title.current()).toBe('Billing — Acme');
		});
		cleanup();
	});

	test('restores the previous title on destroy', () => {
		const cleanup = $effect.root(() => {
			useTitle('Temporary');
			flushSync();
			expect(document.title).toBe('Temporary');
		});

		cleanup();

		expect(document.title).toBe('Baseline');
	});

	test('keeps the title when restoreOnDestroy is false', () => {
		const cleanup = $effect.root(() => {
			useTitle('Sticky', { restoreOnDestroy: false });
			flushSync();
		});

		cleanup();

		expect(document.title).toBe('Sticky');
	});

	test('a nested instance restores the enclosing title, not the baseline', () => {
		// The nesting behaviour <Seo /> depends on: the snapshot is taken at
		// init, so an inner useTitle hands back whatever the outer one set.
		const outer = $effect.root(() => {
			useTitle('Outer');
			flushSync();
		});

		const inner = $effect.root(() => {
			useTitle('Inner');
			flushSync();
			expect(document.title).toBe('Inner');
		});

		inner();
		expect(document.title).toBe('Outer');

		outer();
		expect(document.title).toBe('Baseline');
	});

	test('set() writes immediately', () => {
		const cleanup = $effect.root(() => {
			const title = useTitle('First');
			flushSync();

			title.set('Second');

			expect(document.title).toBe('Second');
			expect(title.current()).toBe('Second');
		});
		cleanup();
	});

	test('observe: true picks up an external write', async () => {
		let title!: ReturnType<typeof useTitle>;
		const cleanup = $effect.root(() => {
			title = useTitle(undefined, { observe: true });
			flushSync();
		});

		expect(title.current()).toBe('Baseline');

		document.title = 'Changed elsewhere';
		// MutationObserver delivers on a microtask, so the getter cannot be
		// asserted on the same tick as the write.
		await Promise.resolve();
		flushSync();

		expect(title.current()).toBe('Changed elsewhere');

		cleanup();
	});

	test('read-only mode without observe does not track external writes', () => {
		const cleanup = $effect.root(() => {
			const title = useTitle();
			flushSync();

			document.title = 'Changed elsewhere';
			flushSync();

			// No observer was attached, so the snapshot is deliberately stale.
			expect(title.current()).toBe('Baseline');
		});
		cleanup();
	});

	test('stops writing after the scope is destroyed', () => {
		let source = $state('Alive');

		const cleanup = $effect.root(() => {
			useTitle(() => source, { restoreOnDestroy: false });
			flushSync();
		});

		cleanup();
		source = 'After destroy';
		flushSync();

		expect(document.title).toBe('Alive');
	});
});

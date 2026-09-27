import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { usePreferredColorScheme } from './usePreferredColorScheme.svelte.js';

const DARK = '(prefers-color-scheme: dark)';
const LIGHT = '(prefers-color-scheme: light)';

type Listener = (event: MediaQueryListEvent) => void;

/** Queries currently reported as matching. */
const matching = new Set<string>();

class MockMediaQueryList {
	static instances: MockMediaQueryList[] = [];

	listeners = new Set<Listener>();

	addEventListener = vi.fn((_type: string, cb: Listener) => {
		this.listeners.add(cb);
	});
	removeEventListener = vi.fn((_type: string, cb: Listener) => {
		this.listeners.delete(cb);
	});

	constructor(readonly media: string) {
		MockMediaQueryList.instances.push(this);
	}

	/** Read live, so the synchronous initial read sees the current set. */
	get matches(): boolean {
		return matching.has(this.media);
	}

	emit() {
		for (const cb of this.listeners) cb({ matches: this.matches } as MediaQueryListEvent);
	}
}

/** Replaces the matching set and notifies every live listener. */
function setMatching(...queries: string[]) {
	matching.clear();
	for (const query of queries) matching.add(query);
	for (const instance of MockMediaQueryList.instances) instance.emit();
}

let original: typeof window.matchMedia;

beforeEach(() => {
	MockMediaQueryList.instances = [];
	matching.clear();
	original = window.matchMedia;
	window.matchMedia = vi.fn(
		(q: string) => new MockMediaQueryList(q) as unknown as MediaQueryList
	) as typeof window.matchMedia;
});

afterEach(() => {
	window.matchMedia = original;
});

describe('usePreferredColorScheme', () => {
	test("reports 'no-preference' when neither query matches", () => {
		// Also the SSR result: every query reports false on the server.
		const cleanup = $effect.root(() => {
			const scheme = usePreferredColorScheme();
			flushSync();
			expect(scheme()).toBe('no-preference');
		});
		cleanup();
	});

	test("reports 'dark' when the dark query matches", () => {
		setMatching(DARK);

		const cleanup = $effect.root(() => {
			const scheme = usePreferredColorScheme();
			flushSync();
			expect(scheme()).toBe('dark');
		});
		cleanup();
	});

	test("reports 'light' when the light query matches", () => {
		setMatching(LIGHT);

		const cleanup = $effect.root(() => {
			const scheme = usePreferredColorScheme();
			flushSync();
			expect(scheme()).toBe('light');
		});
		cleanup();
	});

	test('prefers dark when a user agent reports both', () => {
		// Candidate order decides this; dark is listed first.
		setMatching(DARK, LIGHT);

		const cleanup = $effect.root(() => {
			const scheme = usePreferredColorScheme();
			flushSync();
			expect(scheme()).toBe('dark');
		});
		cleanup();
	});

	test('distinguishes an explicit light preference from no preference', () => {
		// The whole reason this uses two queries rather than negating one.
		const cleanup = $effect.root(() => {
			const scheme = usePreferredColorScheme();
			flushSync();
			expect(scheme()).toBe('no-preference');

			setMatching(LIGHT);
			flushSync();
			expect(scheme()).toBe('light');
		});
		cleanup();
	});

	test('updates as the preference changes', () => {
		const cleanup = $effect.root(() => {
			const scheme = usePreferredColorScheme();
			flushSync();

			setMatching(DARK);
			flushSync();
			expect(scheme()).toBe('dark');

			setMatching(LIGHT);
			flushSync();
			expect(scheme()).toBe('light');

			setMatching();
			flushSync();
			expect(scheme()).toBe('no-preference');
		});
		cleanup();
	});

	test('stops updating after the scope is destroyed', () => {
		let scheme!: () => string;
		const cleanup = $effect.root(() => {
			scheme = usePreferredColorScheme();
			flushSync();
		});

		cleanup();
		setMatching(DARK);

		expect(scheme()).toBe('no-preference');
	});
});

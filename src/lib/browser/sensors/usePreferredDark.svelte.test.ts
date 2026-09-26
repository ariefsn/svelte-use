import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { PREFERS_DARK_QUERY, usePreferredDark } from './usePreferredDark.svelte.js';

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

/** Only the instances carrying a listener belong to the subscribing effect. */
function listening(): MockMediaQueryList[] {
	return MockMediaQueryList.instances.filter((i) => i.addEventListener.mock.calls.length > 0);
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

describe('usePreferredDark', () => {
	test('reports false when the OS has no dark preference', () => {
		const cleanup = $effect.root(() => {
			const isDark = usePreferredDark();
			flushSync();
			expect(isDark()).toBe(false);
		});
		cleanup();
	});

	test('reports true when the dark query matches', () => {
		setMatching(PREFERS_DARK_QUERY);

		const cleanup = $effect.root(() => {
			const isDark = usePreferredDark();
			flushSync();
			expect(isDark()).toBe(true);
		});
		cleanup();
	});

	test('reads the preference synchronously, before any effect runs', () => {
		setMatching(PREFERS_DARK_QUERY);

		const cleanup = $effect.root(() => {
			// No flushSync: consumers such as useColorMode resolve 'auto' during
			// initialisation and would otherwise flash the wrong theme.
			const isDark = usePreferredDark();
			expect(isDark()).toBe(true);
		});
		cleanup();
	});

	test('subscribes with the exported query constant', () => {
		const cleanup = $effect.root(() => {
			usePreferredDark();
			flushSync();
		});

		expect(listening()[0].media).toBe(PREFERS_DARK_QUERY);
		cleanup();
	});

	test('updates when the OS preference changes', () => {
		const cleanup = $effect.root(() => {
			const isDark = usePreferredDark();
			flushSync();
			expect(isDark()).toBe(false);

			setMatching(PREFERS_DARK_QUERY);
			flushSync();
			expect(isDark()).toBe(true);

			setMatching();
			flushSync();
			expect(isDark()).toBe(false);
		});
		cleanup();
	});

	test('removes its listener on scope destroy', () => {
		const cleanup = $effect.root(() => {
			usePreferredDark();
			flushSync();
		});

		cleanup();

		expect(listening()[0].removeEventListener).toHaveBeenCalled();
	});

	test('stops updating after the scope is destroyed', () => {
		let isDark!: () => boolean;
		const cleanup = $effect.root(() => {
			isDark = usePreferredDark();
			flushSync();
		});

		cleanup();
		setMatching(PREFERS_DARK_QUERY);

		expect(isDark()).toBe(false);
	});
});

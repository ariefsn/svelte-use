import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { usePreferredContrast } from './usePreferredContrast.svelte.js';

const MORE = '(prefers-contrast: more)';
const LESS = '(prefers-contrast: less)';
const CUSTOM = '(prefers-contrast: custom)';

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

describe('usePreferredContrast', () => {
	test("reports 'no-preference' when no query matches", () => {
		const cleanup = $effect.root(() => {
			const contrast = usePreferredContrast();
			flushSync();
			expect(contrast()).toBe('no-preference');
		});
		cleanup();
	});

	test("reports 'more'", () => {
		setMatching(MORE);

		const cleanup = $effect.root(() => {
			const contrast = usePreferredContrast();
			flushSync();
			expect(contrast()).toBe('more');
		});
		cleanup();
	});

	test("reports 'less'", () => {
		setMatching(LESS);

		const cleanup = $effect.root(() => {
			const contrast = usePreferredContrast();
			flushSync();
			expect(contrast()).toBe('less');
		});
		cleanup();
	});

	test("reports 'custom'", () => {
		setMatching(CUSTOM);

		const cleanup = $effect.root(() => {
			const contrast = usePreferredContrast();
			flushSync();
			expect(contrast()).toBe('custom');
		});
		cleanup();
	});

	test("prefers 'more' over 'custom' when a forced-colours mode reports both", () => {
		// The ordering decision: 'custom' is checked last so the more
		// actionable answer wins. Windows High Contrast matches both.
		setMatching(MORE, CUSTOM);

		const cleanup = $effect.root(() => {
			const contrast = usePreferredContrast();
			flushSync();
			expect(contrast()).toBe('more');
		});
		cleanup();
	});

	test("prefers 'less' over 'custom' when both match", () => {
		setMatching(LESS, CUSTOM);

		const cleanup = $effect.root(() => {
			const contrast = usePreferredContrast();
			flushSync();
			expect(contrast()).toBe('less');
		});
		cleanup();
	});

	test('updates as the preference changes', () => {
		const cleanup = $effect.root(() => {
			const contrast = usePreferredContrast();
			flushSync();

			setMatching(MORE);
			flushSync();
			expect(contrast()).toBe('more');

			setMatching(LESS);
			flushSync();
			expect(contrast()).toBe('less');

			setMatching();
			flushSync();
			expect(contrast()).toBe('no-preference');
		});
		cleanup();
	});

	test('stops updating after the scope is destroyed', () => {
		let contrast!: () => string;
		const cleanup = $effect.root(() => {
			contrast = usePreferredContrast();
			flushSync();
		});

		cleanup();
		setMatching(MORE);

		expect(contrast()).toBe('no-preference');
	});
});

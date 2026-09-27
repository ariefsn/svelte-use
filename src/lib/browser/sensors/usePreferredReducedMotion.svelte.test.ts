import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { usePreferredReducedMotion } from './usePreferredReducedMotion.svelte.js';

const REDUCE = '(prefers-reduced-motion: reduce)';

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

describe('usePreferredReducedMotion', () => {
	test("reports 'no-preference' when the query does not match", () => {
		// Also the SSR result — animations run normally until proven otherwise.
		const cleanup = $effect.root(() => {
			const motion = usePreferredReducedMotion();
			flushSync();
			expect(motion()).toBe('no-preference');
		});
		cleanup();
	});

	test("reports 'reduce' when the user asked for less motion", () => {
		setMatching(REDUCE);

		const cleanup = $effect.root(() => {
			const motion = usePreferredReducedMotion();
			flushSync();
			expect(motion()).toBe('reduce');
		});
		cleanup();
	});

	test('reads the preference synchronously, before any effect runs', () => {
		setMatching(REDUCE);

		const cleanup = $effect.root(() => {
			const motion = usePreferredReducedMotion();
			expect(motion()).toBe('reduce');
		});
		cleanup();
	});

	test('updates as the preference changes', () => {
		const cleanup = $effect.root(() => {
			const motion = usePreferredReducedMotion();
			flushSync();

			setMatching(REDUCE);
			flushSync();
			expect(motion()).toBe('reduce');

			setMatching();
			flushSync();
			expect(motion()).toBe('no-preference');
		});
		cleanup();
	});

	test('stops updating after the scope is destroyed', () => {
		let motion!: () => string;
		const cleanup = $effect.root(() => {
			motion = usePreferredReducedMotion();
			flushSync();
		});

		cleanup();
		setMatching(REDUCE);

		expect(motion()).toBe('no-preference');
	});
});

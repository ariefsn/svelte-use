import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useMediaQuery } from './useMediaQuery.svelte.js';

type Listener = (event: MediaQueryListEvent) => void;

class MockMediaQueryList {
	static instances: MockMediaQueryList[] = [];

	matches = false;
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

	/** Simulate the viewport changing. */
	emit(matches: boolean) {
		this.matches = matches;
		for (const cb of this.listeners) cb({ matches } as MediaQueryListEvent);
	}
}

/**
 * useMediaQuery calls matchMedia twice per query — once for the synchronous
 * initial read and once in the effect that subscribes. Only the latter carries
 * a listener, so assertions target those.
 */
function listening(): MockMediaQueryList[] {
	return MockMediaQueryList.instances.filter((i) => i.addEventListener.mock.calls.length > 0);
}

let original: typeof window.matchMedia;

beforeEach(() => {
	MockMediaQueryList.instances = [];
	original = window.matchMedia;
	window.matchMedia = vi.fn(
		(q: string) => new MockMediaQueryList(q) as unknown as MediaQueryList
	) as typeof window.matchMedia;
});

afterEach(() => {
	window.matchMedia = original;
});

describe('useMediaQuery', () => {
	test('reports the initial match state', () => {
		const cleanup = $effect.root(() => {
			const matches = useMediaQuery('(min-width: 768px)');
			flushSync();
			expect(matches()).toBe(false);

			listening()[0].emit(true);
			flushSync();
			expect(matches()).toBe(true);
		});
		cleanup();
	});

	test('passes the query through to matchMedia', () => {
		const cleanup = $effect.root(() => {
			useMediaQuery('(prefers-reduced-motion: reduce)');
			flushSync();
		});

		expect(listening()[0].media).toBe('(prefers-reduced-motion: reduce)');
		cleanup();
	});

	test('reads the initial match synchronously, before any effect runs', () => {
		// Consumers such as useBreakpoints rely on this: deferring to the
		// effect would make them flash their non-matching branch on first
		// render.
		window.matchMedia = vi.fn((q: string) => {
			const mql = new MockMediaQueryList(q);
			mql.matches = true;
			return mql as unknown as MediaQueryList;
		}) as typeof window.matchMedia;

		const cleanup = $effect.root(() => {
			const matches = useMediaQuery('(min-width: 768px)');
			expect(matches()).toBe(true);
		});
		cleanup();
	});

	test('rebuilds the listener when a reactive query changes', () => {
		const cleanup = $effect.root(() => {
			let width = $state(768);
			useMediaQuery(() => `(min-width: ${width}px)`);
			flushSync();

			expect(listening()).toHaveLength(1);
			expect(listening()[0].media).toBe('(min-width: 768px)');

			width = 1024;
			flushSync();

			expect(listening()).toHaveLength(2);
			expect(listening()[1].media).toBe('(min-width: 1024px)');
			// The superseded listener must be detached.
			expect(listening()[0].removeEventListener).toHaveBeenCalled();
		});
		cleanup();
	});

	test('removes the listener on scope destroy', () => {
		const cleanup = $effect.root(() => {
			useMediaQuery('(min-width: 768px)');
			flushSync();
		});

		cleanup();

		expect(listening()[0].removeEventListener).toHaveBeenCalled();
	});

	test('stops updating after the scope is destroyed', () => {
		let matches!: () => boolean;
		const cleanup = $effect.root(() => {
			matches = useMediaQuery('(min-width: 768px)');
			flushSync();
		});

		const mql = listening()[0];
		cleanup();
		mql.emit(true);

		expect(matches()).toBe(false);
	});
});

import { flushSync } from 'svelte';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { useIntersectionObserver } from './useIntersectionObserver.svelte.js';

// ---------------------------------------------------------------------------
// Mock IntersectionObserver
// ---------------------------------------------------------------------------

type IntersectionCallback = (entries: IntersectionObserverEntry[]) => void;

class MockIntersectionObserver {
	private callback: IntersectionCallback;
	readonly root: Element | Document | null = null;
	readonly rootMargin: string = '0px';
	readonly thresholds: ReadonlyArray<number> = [0];

	static instances: MockIntersectionObserver[] = [];

	observe = vi.fn();
	unobserve = vi.fn();
	disconnect = vi.fn();
	takeRecords = vi.fn(() => [] as IntersectionObserverEntry[]);

	constructor(callback: IntersectionCallback, _options?: IntersectionObserverInit) {
		this.callback = callback;
		MockIntersectionObserver.instances.push(this);
	}

	/** Simulate an intersection change. */
	trigger(isIntersecting: boolean, target?: Element): void {
		const el = target ?? document.createElement('div');
		const entry = {
			isIntersecting,
			target: el,
			intersectionRatio: isIntersecting ? 1 : 0,
			boundingClientRect: el.getBoundingClientRect(),
			intersectionRect: el.getBoundingClientRect(),
			rootBounds: null,
			time: performance.now()
		} as IntersectionObserverEntry;

		this.callback([entry]);
	}
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
	MockIntersectionObserver.instances = [];
	vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
});

afterEach(() => {
	vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useIntersectionObserver', () => {
	test('isIntersecting starts as false', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		const cleanup = $effect.root(() => {
			const { isIntersecting } = useIntersectionObserver(() => el);
			flushSync();
			expect(isIntersecting()).toBe(false);
		});

		cleanup();
		el.remove();
	});

	test('entry starts as null', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		const cleanup = $effect.root(() => {
			const { entry } = useIntersectionObserver(() => el);
			flushSync();
			expect(entry()).toBeNull();
		});

		cleanup();
		el.remove();
	});

	test('isIntersecting becomes true when observer fires with isIntersecting=true', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		let result!: ReturnType<typeof useIntersectionObserver>;

		const cleanup = $effect.root(() => {
			result = useIntersectionObserver(() => el);
		});

		flushSync();

		MockIntersectionObserver.instances[0].trigger(true, el);

		expect(result.isIntersecting()).toBe(true);

		cleanup();
		el.remove();
	});

	test('isIntersecting becomes false when observer fires with isIntersecting=false', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		let result!: ReturnType<typeof useIntersectionObserver>;

		const cleanup = $effect.root(() => {
			result = useIntersectionObserver(() => el);
		});

		flushSync();

		MockIntersectionObserver.instances[0].trigger(true, el);
		expect(result.isIntersecting()).toBe(true);

		MockIntersectionObserver.instances[0].trigger(false, el);
		expect(result.isIntersecting()).toBe(false);

		cleanup();
		el.remove();
	});

	test('entry is populated after first observation', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		let result!: ReturnType<typeof useIntersectionObserver>;

		const cleanup = $effect.root(() => {
			result = useIntersectionObserver(() => el);
		});

		flushSync();

		expect(result.entry()).toBeNull();
		MockIntersectionObserver.instances[0].trigger(true, el);
		expect(result.entry()).not.toBeNull();
		expect(result.entry()!.isIntersecting).toBe(true);

		cleanup();
		el.remove();
	});

	test('observe is called with the target element', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		const cleanup = $effect.root(() => {
			useIntersectionObserver(() => el);
		});

		flushSync();

		expect(MockIntersectionObserver.instances[0].observe).toHaveBeenCalledWith(el);

		cleanup();
		el.remove();
	});

	test('does not create observer when target is null', () => {
		const cleanup = $effect.root(() => {
			useIntersectionObserver(() => null);
		});

		flushSync();

		expect(MockIntersectionObserver.instances).toHaveLength(0);

		cleanup();
	});

	test('stop() disconnects the observer', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		let result!: ReturnType<typeof useIntersectionObserver>;

		const cleanup = $effect.root(() => {
			result = useIntersectionObserver(() => el);
		});

		flushSync();

		const observer = MockIntersectionObserver.instances[0];
		expect(observer.disconnect).not.toHaveBeenCalled();

		result.stop();

		expect(observer.disconnect).toHaveBeenCalled();

		cleanup();
		el.remove();
	});

	test('stop() prevents further isIntersecting updates', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		let result!: ReturnType<typeof useIntersectionObserver>;

		const cleanup = $effect.root(() => {
			result = useIntersectionObserver(() => el);
		});

		flushSync();

		result.stop();

		// After stop, manually triggering the (now-disconnected) mock callback
		// should not update state since the observer is disconnected
		MockIntersectionObserver.instances[0].trigger(true, el);

		// State should remain false since stop was called before any trigger
		expect(result.isIntersecting()).toBe(false);

		cleanup();
		el.remove();
	});

	test('disconnects observer on reactive scope cleanup', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		const cleanup = $effect.root(() => {
			useIntersectionObserver(() => el);
		});

		flushSync();

		const observer = MockIntersectionObserver.instances[0];
		cleanup();
		flushSync();

		expect(observer.disconnect).toHaveBeenCalled();

		el.remove();
	});

	test('does not throw when IntersectionObserver is not available (SSR)', () => {
		vi.unstubAllGlobals();
		delete (globalThis as Record<string, unknown>).IntersectionObserver;

		const el = document.createElement('div');

		expect(() => {
			const cleanup = $effect.root(() => {
				const { isIntersecting, entry } = useIntersectionObserver(() => el);
				flushSync();
				expect(isIntersecting()).toBe(false);
				expect(entry()).toBeNull();
			});
			cleanup();
		}).not.toThrow();

		el.remove();
	});
});

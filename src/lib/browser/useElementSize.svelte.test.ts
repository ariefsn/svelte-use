import { flushSync } from 'svelte';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { useElementSize } from './useElementSize.svelte.js';

// ---------------------------------------------------------------------------
// Mock ResizeObserver
// ---------------------------------------------------------------------------

type ResizeCallback = (entries: ResizeObserverEntry[]) => void;

class MockResizeObserver {
	private callback: ResizeCallback;
	static instances: MockResizeObserver[] = [];

	observe = vi.fn();
	unobserve = vi.fn();
	disconnect = vi.fn();

	constructor(callback: ResizeCallback) {
		this.callback = callback;
		MockResizeObserver.instances.push(this);
	}

	/** Simulate a resize event with the given dimensions. */
	trigger(width: number, height: number): void {
		const entry = {
			contentRect: { width, height } as DOMRectReadOnly,
			contentBoxSize: [{ inlineSize: width, blockSize: height }] as ResizeObserverSize[],
			borderBoxSize: [{ inlineSize: width + 20, blockSize: height + 20 }] as ResizeObserverSize[],
			devicePixelContentBoxSize: [] as ResizeObserverSize[],
			target: document.createElement('div')
		} as ResizeObserverEntry;

		this.callback([entry]);
	}
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
	MockResizeObserver.instances = [];
	vi.stubGlobal('ResizeObserver', MockResizeObserver);
});

afterEach(() => {
	vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useElementSize', () => {
	test('returns 0 for width and height before any resize event', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		const cleanup = $effect.root(() => {
			const { width, height } = useElementSize(() => el);
			flushSync();
			expect(width()).toBe(0);
			expect(height()).toBe(0);
		});

		cleanup();
		el.remove();
	});

	test('returns 0 when target is null', () => {
		const cleanup = $effect.root(() => {
			const { width, height } = useElementSize(() => null);
			flushSync();
			expect(width()).toBe(0);
			expect(height()).toBe(0);
		});

		cleanup();
	});

	test('updates width and height when ResizeObserver fires', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		let size!: ReturnType<typeof useElementSize>;

		const cleanup = $effect.root(() => {
			size = useElementSize(() => el);
		});

		flushSync();

		const observer = MockResizeObserver.instances[0];
		observer.trigger(320, 240);

		expect(size.width()).toBe(320);
		expect(size.height()).toBe(240);

		cleanup();
		el.remove();
	});

	test('reflects subsequent resize events', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		let size!: ReturnType<typeof useElementSize>;

		const cleanup = $effect.root(() => {
			size = useElementSize(() => el);
		});

		flushSync();

		const observer = MockResizeObserver.instances[0];
		observer.trigger(100, 50);
		expect(size.width()).toBe(100);
		expect(size.height()).toBe(50);

		observer.trigger(800, 600);
		expect(size.width()).toBe(800);
		expect(size.height()).toBe(600);

		cleanup();
		el.remove();
	});

	test('uses border-box sizes when box option is "border-box"', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		let size!: ReturnType<typeof useElementSize>;

		const cleanup = $effect.root(() => {
			size = useElementSize(() => el, { box: 'border-box' });
		});

		flushSync();

		const observer = MockResizeObserver.instances[0];
		// borderBoxSize is inlineSize + 20, blockSize + 20 in our mock
		observer.trigger(100, 50);

		expect(size.width()).toBe(120);
		expect(size.height()).toBe(70);

		cleanup();
		el.remove();
	});

	test('uses content-box sizes by default', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		let size!: ReturnType<typeof useElementSize>;

		const cleanup = $effect.root(() => {
			size = useElementSize(() => el);
		});

		flushSync();

		const observer = MockResizeObserver.instances[0];
		observer.trigger(200, 100);

		expect(size.width()).toBe(200);
		expect(size.height()).toBe(100);

		cleanup();
		el.remove();
	});

	test('calls observe on the target element', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		const cleanup = $effect.root(() => {
			useElementSize(() => el);
		});

		flushSync();

		const observer = MockResizeObserver.instances[0];
		expect(observer.observe).toHaveBeenCalledWith(el, { box: 'content-box' });

		cleanup();
		el.remove();
	});

	test('disconnects observer on cleanup', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		const cleanup = $effect.root(() => {
			useElementSize(() => el);
		});

		flushSync();

		const observer = MockResizeObserver.instances[0];
		expect(observer.disconnect).not.toHaveBeenCalled();

		cleanup();
		flushSync();

		expect(observer.disconnect).toHaveBeenCalled();

		el.remove();
	});

	test('resets to 0 when target becomes null', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		let target = $state<HTMLElement | null>(el);
		let size!: ReturnType<typeof useElementSize>;

		const cleanup = $effect.root(() => {
			size = useElementSize(() => target);
		});

		flushSync();

		const observer = MockResizeObserver.instances[0];
		observer.trigger(400, 300);
		expect(size.width()).toBe(400);
		expect(size.height()).toBe(300);

		target = null;
		flushSync();

		expect(size.width()).toBe(0);
		expect(size.height()).toBe(0);

		cleanup();
		el.remove();
	});

	test('does not throw when ResizeObserver is not available (SSR)', () => {
		vi.unstubAllGlobals();
		delete (globalThis as Record<string, unknown>).ResizeObserver;

		const el = document.createElement('div');

		expect(() => {
			const cleanup = $effect.root(() => {
				const { width, height } = useElementSize(() => el);
				flushSync();
				expect(width()).toBe(0);
				expect(height()).toBe(0);
			});
			cleanup();
		}).not.toThrow();

		el.remove();
	});
});

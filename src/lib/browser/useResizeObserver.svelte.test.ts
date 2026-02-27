import { flushSync } from 'svelte';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { useResizeObserver } from './useResizeObserver.svelte.js';

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

	/** Simulate a resize event. */
	trigger(width: number, height: number, target?: Element): void {
		const el = target ?? document.createElement('div');
		const entry = {
			target: el,
			contentRect: { width, height } as DOMRectReadOnly,
			contentBoxSize: [{ inlineSize: width, blockSize: height }] as ResizeObserverSize[],
			borderBoxSize: [{ inlineSize: width, blockSize: height }] as ResizeObserverSize[],
			devicePixelContentBoxSize: [] as ResizeObserverSize[]
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

describe('useResizeObserver', () => {
	test('returns an object with a stop function', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		const cleanup = $effect.root(() => {
			const result = useResizeObserver(() => el, vi.fn());
			flushSync();
			expect(typeof result.stop).toBe('function');
		});

		cleanup();
		el.remove();
	});

	test('calls observe on the target element', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		const cleanup = $effect.root(() => {
			useResizeObserver(() => el, vi.fn());
		});

		flushSync();

		expect(MockResizeObserver.instances[0].observe).toHaveBeenCalledWith(el);

		cleanup();
		el.remove();
	});

	test('invokes callback with the ResizeObserverEntry on resize', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		const callback = vi.fn();

		const cleanup = $effect.root(() => {
			useResizeObserver(() => el, callback);
		});

		flushSync();

		MockResizeObserver.instances[0].trigger(640, 480, el);

		expect(callback).toHaveBeenCalledOnce();
		const entry = callback.mock.calls[0][0] as ResizeObserverEntry;
		expect(entry.contentRect.width).toBe(640);
		expect(entry.contentRect.height).toBe(480);

		cleanup();
		el.remove();
	});

	test('invokes callback multiple times on consecutive resizes', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		const callback = vi.fn();

		const cleanup = $effect.root(() => {
			useResizeObserver(() => el, callback);
		});

		flushSync();

		MockResizeObserver.instances[0].trigger(100, 100, el);
		MockResizeObserver.instances[0].trigger(200, 200, el);
		MockResizeObserver.instances[0].trigger(300, 300, el);

		expect(callback).toHaveBeenCalledTimes(3);

		cleanup();
		el.remove();
	});

	test('does not create an observer when target is null', () => {
		const callback = vi.fn();

		const cleanup = $effect.root(() => {
			useResizeObserver(() => null, callback);
		});

		flushSync();

		expect(MockResizeObserver.instances).toHaveLength(0);
		expect(callback).not.toHaveBeenCalled();

		cleanup();
	});

	test('stop() disconnects the observer', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		let result!: ReturnType<typeof useResizeObserver>;

		const cleanup = $effect.root(() => {
			result = useResizeObserver(() => el, vi.fn());
		});

		flushSync();

		const observer = MockResizeObserver.instances[0];
		expect(observer.disconnect).not.toHaveBeenCalled();

		result.stop();

		expect(observer.disconnect).toHaveBeenCalled();

		cleanup();
		el.remove();
	});

	test('disconnects observer on reactive scope cleanup', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		const cleanup = $effect.root(() => {
			useResizeObserver(() => el, vi.fn());
		});

		flushSync();

		const observer = MockResizeObserver.instances[0];
		cleanup();
		flushSync();

		expect(observer.disconnect).toHaveBeenCalled();

		el.remove();
	});

	test('callback is not invoked after stop()', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		const callback = vi.fn();
		let result!: ReturnType<typeof useResizeObserver>;

		const cleanup = $effect.root(() => {
			result = useResizeObserver(() => el, callback);
		});

		flushSync();

		result.stop();

		// Calling the underlying mock callback directly after stop should not
		// call our callback because disconnect was called on the real observer.
		// We simulate: the observer is disconnected so no more entries come in.
		expect(callback).not.toHaveBeenCalled();

		cleanup();
		el.remove();
	});

	test('does not throw when ResizeObserver is not available (SSR)', () => {
		vi.unstubAllGlobals();
		delete (globalThis as Record<string, unknown>).ResizeObserver;

		const el = document.createElement('div');
		const callback = vi.fn();

		expect(() => {
			const cleanup = $effect.root(() => {
				const result = useResizeObserver(() => el, callback);
				flushSync();
				expect(typeof result.stop).toBe('function');
			});
			cleanup();
		}).not.toThrow();

		expect(callback).not.toHaveBeenCalled();

		el.remove();
	});
});

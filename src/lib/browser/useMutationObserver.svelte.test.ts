import { flushSync } from 'svelte';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { useMutationObserver } from './useMutationObserver.svelte.js';

// ---------------------------------------------------------------------------
// Mock MutationObserver
// ---------------------------------------------------------------------------

class MockMutationObserver {
	private callback: MutationCallback;
	static instances: MockMutationObserver[] = [];

	observe = vi.fn();
	disconnect = vi.fn();
	takeRecords = vi.fn(() => [] as MutationRecord[]);

	constructor(callback: MutationCallback) {
		this.callback = callback;
		MockMutationObserver.instances.push(this);
	}

	/** Simulate a batch of mutations. */
	trigger(records: Partial<MutationRecord>[]): void {
		const full = records.map(
			(r) =>
				({
					type: 'childList',
					target: document.createElement('div'),
					addedNodes: { length: 0 } as unknown as NodeList,
					removedNodes: { length: 0 } as unknown as NodeList,
					previousSibling: null,
					nextSibling: null,
					attributeName: null,
					attributeNamespace: null,
					oldValue: null,
					...r
				}) as MutationRecord
		);
		this.callback(full, this as unknown as MutationObserver);
	}
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
	MockMutationObserver.instances = [];
	vi.stubGlobal('MutationObserver', MockMutationObserver);
});

afterEach(() => {
	vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useMutationObserver', () => {
	test('returns an object with a stop function', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		const cleanup = $effect.root(() => {
			const result = useMutationObserver(() => el, vi.fn(), { childList: true });
			flushSync();
			expect(typeof result.stop).toBe('function');
		});

		cleanup();
		el.remove();
	});

	test('calls observe with the target node and options', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		const options: MutationObserverInit = { childList: true, subtree: true };

		const cleanup = $effect.root(() => {
			useMutationObserver(() => el, vi.fn(), options);
		});

		flushSync();

		expect(MockMutationObserver.instances[0].observe).toHaveBeenCalledWith(el, options);

		cleanup();
		el.remove();
	});

	test('invokes callback when mutations are triggered', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		const callback = vi.fn();

		const cleanup = $effect.root(() => {
			useMutationObserver(() => el, callback, { childList: true });
		});

		flushSync();

		MockMutationObserver.instances[0].trigger([{ type: 'childList' }]);

		expect(callback).toHaveBeenCalledOnce();
		const records = callback.mock.calls[0][0] as MutationRecord[];
		expect(records[0].type).toBe('childList');

		cleanup();
		el.remove();
	});

	test('invokes callback multiple times for multiple mutation batches', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		const callback = vi.fn();

		const cleanup = $effect.root(() => {
			useMutationObserver(() => el, callback, { childList: true });
		});

		flushSync();

		const observer = MockMutationObserver.instances[0];
		observer.trigger([{ type: 'childList' }]);
		observer.trigger([{ type: 'attributes' }]);
		observer.trigger([{ type: 'characterData' }]);

		expect(callback).toHaveBeenCalledTimes(3);

		cleanup();
		el.remove();
	});

	test('does not create an observer when target is null', () => {
		const callback = vi.fn();

		const cleanup = $effect.root(() => {
			useMutationObserver(() => null, callback, { childList: true });
		});

		flushSync();

		expect(MockMutationObserver.instances).toHaveLength(0);
		expect(callback).not.toHaveBeenCalled();

		cleanup();
	});

	test('stop() disconnects the observer', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		let result!: ReturnType<typeof useMutationObserver>;

		const cleanup = $effect.root(() => {
			result = useMutationObserver(() => el, vi.fn(), { childList: true });
		});

		flushSync();

		const observer = MockMutationObserver.instances[0];
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
			useMutationObserver(() => el, vi.fn(), { childList: true });
		});

		flushSync();

		const observer = MockMutationObserver.instances[0];
		cleanup();
		flushSync();

		expect(observer.disconnect).toHaveBeenCalled();

		el.remove();
	});

	test('supports attribute observation', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		const callback = vi.fn();

		const cleanup = $effect.root(() => {
			useMutationObserver(() => el, callback, { attributes: true });
		});

		flushSync();

		expect(MockMutationObserver.instances[0].observe).toHaveBeenCalledWith(el, {
			attributes: true
		});

		MockMutationObserver.instances[0].trigger([{ type: 'attributes', attributeName: 'class' }]);

		expect(callback).toHaveBeenCalledOnce();
		const records = callback.mock.calls[0][0] as MutationRecord[];
		expect(records[0].type).toBe('attributes');
		expect(records[0].attributeName).toBe('class');

		cleanup();
		el.remove();
	});

	test('works with a Node target (non-HTMLElement)', () => {
		const fragment = document.createDocumentFragment();
		const callback = vi.fn();

		const cleanup = $effect.root(() => {
			useMutationObserver(() => fragment, callback, { childList: true });
		});

		flushSync();

		expect(MockMutationObserver.instances[0].observe).toHaveBeenCalledWith(fragment, {
			childList: true
		});

		cleanup();
	});

	test('does not throw when MutationObserver is not available (SSR)', () => {
		vi.unstubAllGlobals();
		delete (globalThis as Record<string, unknown>).MutationObserver;

		const el = document.createElement('div');
		const callback = vi.fn();

		expect(() => {
			const cleanup = $effect.root(() => {
				const result = useMutationObserver(() => el, callback, { childList: true });
				flushSync();
				expect(typeof result.stop).toBe('function');
			});
			cleanup();
		}).not.toThrow();

		expect(callback).not.toHaveBeenCalled();

		el.remove();
	});
});

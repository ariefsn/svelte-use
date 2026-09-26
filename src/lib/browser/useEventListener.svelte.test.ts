import { describe, expect, test, vi } from 'vitest';
import { flushSync } from 'svelte';
import { useEventListener } from './useEventListener.svelte.js';

describe('useEventListener', () => {
	test('adds event listener', () => {
		const handler = vi.fn();
		const cleanup = $effect.root(() => {
			useEventListener(window, 'click', handler);
			flushSync();
		});

		window.dispatchEvent(new Event('click'));
		expect(handler).toHaveBeenCalledOnce();
		cleanup();
	});

	test('removes listener on cleanup', () => {
		const handler = vi.fn();
		const cleanup = $effect.root(() => {
			useEventListener(window, 'click', handler);
			flushSync();
		});

		cleanup();
		flushSync();

		window.dispatchEvent(new Event('click'));
		expect(handler).not.toHaveBeenCalled();
	});

	test('supports multiple events', () => {
		const handler = vi.fn();
		const cleanup = $effect.root(() => {
			useEventListener(document, ['mousedown', 'mouseup'] as const, handler);
			flushSync();
		});

		document.dispatchEvent(new Event('mousedown'));
		document.dispatchEvent(new Event('mouseup'));
		expect(handler).toHaveBeenCalledTimes(2);
		cleanup();
	});

	test('returns manual cleanup function', () => {
		const handler = vi.fn();
		let manualCleanup!: () => void;
		const cleanup = $effect.root(() => {
			manualCleanup = useEventListener(window, 'resize', handler);
			flushSync();
		});

		manualCleanup();
		window.dispatchEvent(new Event('resize'));
		expect(handler).not.toHaveBeenCalled();
		cleanup();
	});

	test('accepts a getter for window, for SSR safety', () => {
		// A bare `window` is evaluated at component init and throws during SSR.
		// The getter form defers that to the effect, which never runs on the
		// server — this is what the docs demos use.
		const handler = vi.fn();

		const cleanup = $effect.root(() => {
			useEventListener(() => window, 'click', handler);
			flushSync();
		});

		window.dispatchEvent(new Event('click'));
		expect(handler).toHaveBeenCalledOnce();

		cleanup();
		window.dispatchEvent(new Event('click'));
		expect(handler).toHaveBeenCalledOnce();
	});

	test('accepts a getter for document', () => {
		const handler = vi.fn();

		const cleanup = $effect.root(() => {
			useEventListener(() => document, 'mousedown', handler);
			flushSync();
		});

		document.dispatchEvent(new Event('mousedown'));
		expect(handler).toHaveBeenCalledOnce();

		cleanup();
	});

	// The fourth overload. Window/Document/HTMLElement have their own; these
	// targets resolve through `EventTargetEventMap`, which is what lets the
	// Web API composables listen without hand-rolling `addEventListener`.
	describe('arbitrary event targets', () => {
		test('listens on a BroadcastChannel and cleans up', () => {
			const channel = new BroadcastChannel('use-event-listener-test');
			const handler = vi.fn();

			const cleanup = $effect.root(() => {
				useEventListener(channel, 'message', handler);
				flushSync();
			});

			channel.dispatchEvent(new MessageEvent('message', { data: 'hello' }));
			expect(handler).toHaveBeenCalledOnce();

			cleanup();
			flushSync();

			channel.dispatchEvent(new MessageEvent('message', { data: 'ignored' }));
			expect(handler).toHaveBeenCalledOnce();

			channel.close();
		});

		test('narrows the event to the target-specific type', () => {
			const channel = new BroadcastChannel('use-event-listener-types');
			let seen: string | null = null;

			const cleanup = $effect.root(() => {
				// `event` is a MessageEvent here, not a bare Event — reading
				// `.data` would not compile if the overload fell back.
				useEventListener(channel, 'message', (event) => {
					seen = typeof event.data === 'string' ? event.data : null;
				});
				flushSync();
			});

			channel.dispatchEvent(new MessageEvent('message', { data: 'typed' }));
			expect(seen).toBe('typed');

			cleanup();
			channel.close();
		});

		test('rejects an event name the target does not emit', () => {
			// The real assertion here is the `@ts-expect-error`: if the overload
			// ever widened back to accepting any string, `bun run check` would
			// fail on an unused directive. The runtime half only records that
			// the guard is purely type-level and does not change behaviour —
			// `requireAssertions` is on, so the test needs it either way.
			const channel = new BroadcastChannel('use-event-listener-bad-name');
			let stop!: () => void;

			const cleanup = $effect.root(() => {
				// @ts-expect-error -- 'resize' is not in BroadcastChannelEventMap
				stop = useEventListener(channel, 'resize', () => {});
			});

			expect(typeof stop).toBe('function');

			cleanup();
			channel.close();
		});
	});
});

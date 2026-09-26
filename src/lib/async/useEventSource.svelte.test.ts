import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useEventSource } from './useEventSource.svelte.js';

/**
 * There is no SSE server in the test environment, so `EventSource` is stubbed.
 * The composable resolves the global at call time rather than capturing it at
 * module scope, which is what makes `vi.stubGlobal` work here — but the stub
 * must still be installed before the composable is constructed.
 */

let instances: FakeEventSource[] = [];

class FakeEventSource extends EventTarget {
	static readonly CONNECTING = 0;
	static readonly OPEN = 1;
	static readonly CLOSED = 2;

	readyState = FakeEventSource.CONNECTING;
	onopen: ((event: Event) => void) | null = null;
	onmessage: ((event: MessageEvent<string>) => void) | null = null;
	onerror: ((event: Event) => void) | null = null;
	close = vi.fn(() => {
		this.readyState = FakeEventSource.CLOSED;
	});

	constructor(
		readonly url: string,
		readonly init?: EventSourceInit
	) {
		super();
		instances.push(this);
	}

	/** The server accepted the connection. */
	emitOpen() {
		this.readyState = FakeEventSource.OPEN;
		this.onopen?.(new Event('open'));
	}

	/** An unnamed `data:` frame. */
	emitMessage(data: string, lastEventId = '') {
		this.onmessage?.(new MessageEvent('message', { data, lastEventId }));
	}

	/** A named `event: <name>` frame, which bypasses onmessage entirely. */
	emitNamed(name: string, data: string) {
		this.dispatchEvent(new MessageEvent(name, { data }));
	}

	/** `fatal` distinguishes an HTTP failure from a drop the browser will retry. */
	emitError(fatal: boolean) {
		this.readyState = fatal ? FakeEventSource.CLOSED : FakeEventSource.CONNECTING;
		this.onerror?.(new Event('error'));
	}
}

beforeEach(() => {
	instances = [];
	vi.stubGlobal('EventSource', FakeEventSource);
});

afterEach(() => {
	vi.unstubAllGlobals();
});

/** The most recently constructed fake. */
const latest = () => instances[instances.length - 1];

describe('useEventSource', () => {
	test('connects and reports status through the lifecycle', () => {
		let stream!: ReturnType<typeof useEventSource<string>>;
		const cleanup = $effect.root(() => {
			stream = useEventSource<string>(() => '/api/stream');
		});
		flushSync();

		expect(stream.status()).toBe('CONNECTING');
		expect(latest().url).toBe('/api/stream');

		latest().emitOpen();
		flushSync();
		expect(stream.status()).toBe('OPEN');

		cleanup();
	});

	test('parses a JSON message and records the event name', () => {
		let stream!: ReturnType<typeof useEventSource<{ price: number }>>;
		const cleanup = $effect.root(() => {
			stream = useEventSource<{ price: number }>(() => '/api/ticker');
		});
		flushSync();

		latest().emitOpen();
		latest().emitMessage('{"price":42}', 'evt-7');
		flushSync();

		expect(stream.data()).toEqual({ price: 42 });
		expect(stream.event()).toBe('message');
		expect(stream.lastEventId()).toBe('evt-7');

		cleanup();
	});

	test('leaves a non-JSON payload as a string', () => {
		let stream!: ReturnType<typeof useEventSource<string>>;
		const cleanup = $effect.root(() => {
			stream = useEventSource<string>(() => '/api/stream');
		});
		flushSync();

		latest().emitMessage('plain text');
		flushSync();

		expect(stream.data()).toBe('plain text');

		cleanup();
	});

	test('receives named events listed in options', () => {
		let stream!: ReturnType<typeof useEventSource<{ beat: number }>>;
		const cleanup = $effect.root(() => {
			stream = useEventSource<{ beat: number }>(() => '/api/stream', { events: ['heartbeat'] });
		});
		flushSync();

		latest().emitNamed('heartbeat', '{"beat":1}');
		flushSync();

		expect(stream.event()).toBe('heartbeat');
		expect(stream.data()).toEqual({ beat: 1 });

		cleanup();
	});

	test('drops a named event that was not listed', () => {
		// The documented footgun: a named event never reaches onmessage.
		let stream!: ReturnType<typeof useEventSource<string>>;
		const cleanup = $effect.root(() => {
			stream = useEventSource<string>(() => '/api/stream');
		});
		flushSync();

		latest().emitNamed('heartbeat', 'tick');
		flushSync();

		expect(stream.data()).toBeNull();
		expect(stream.event()).toBeNull();

		cleanup();
	});

	test('stays CONNECTING on a retryable drop, but CLOSED on a fatal one', () => {
		let stream!: ReturnType<typeof useEventSource<string>>;
		const cleanup = $effect.root(() => {
			stream = useEventSource<string>(() => '/api/stream');
		});
		flushSync();

		latest().emitOpen();
		flushSync();

		// The browser will retry this one on its own.
		latest().emitError(false);
		flushSync();
		expect(stream.status()).toBe('CONNECTING');
		expect(stream.error()).not.toBeNull();

		// An HTTP-level failure ends the stream for good.
		latest().emitError(true);
		flushSync();
		expect(stream.status()).toBe('CLOSED');

		cleanup();
	});

	test('reconnects to a new URL and ignores the superseded connection', () => {
		let endpoint = $state('/api/one');
		let stream!: ReturnType<typeof useEventSource<string>>;
		const cleanup = $effect.root(() => {
			stream = useEventSource<string>(() => endpoint);
		});
		flushSync();

		const first = latest();
		first.emitOpen();
		flushSync();

		endpoint = '/api/two';
		flushSync();

		expect(latest().url).toBe('/api/two');
		expect(first.close).toHaveBeenCalled();

		// A late frame from the old connection must not write state.
		first.emitMessage('stale');
		flushSync();
		expect(stream.data()).toBeNull();

		cleanup();
	});

	test('stays disconnected while the URL is undefined', () => {
		let stream!: ReturnType<typeof useEventSource<string>>;
		const cleanup = $effect.root(() => {
			stream = useEventSource<string>(() => undefined);
		});
		flushSync();

		expect(instances).toHaveLength(0);
		expect(stream.status()).toBe('CLOSED');

		cleanup();
	});

	test('immediate:false waits for open()', () => {
		let stream!: ReturnType<typeof useEventSource<string>>;
		const cleanup = $effect.root(() => {
			stream = useEventSource<string>(() => '/api/stream', { immediate: false });
		});
		flushSync();

		expect(instances).toHaveLength(0);

		stream.open();
		flushSync();

		expect(instances).toHaveLength(1);
		expect(stream.status()).toBe('CONNECTING');

		cleanup();
	});

	test('close() closes the stream and stops the browser reconnecting', () => {
		let stream!: ReturnType<typeof useEventSource<string>>;
		const cleanup = $effect.root(() => {
			stream = useEventSource<string>(() => '/api/stream');
		});
		flushSync();

		const source = latest();
		stream.close();
		flushSync();

		expect(source.close).toHaveBeenCalled();
		expect(stream.status()).toBe('CLOSED');

		cleanup();
	});

	test('closes the connection when the scope is destroyed', () => {
		const cleanup = $effect.root(() => {
			useEventSource<string>(() => '/api/stream');
		});
		flushSync();

		const source = latest();
		cleanup();
		flushSync();

		expect(source.close).toHaveBeenCalled();
	});
});

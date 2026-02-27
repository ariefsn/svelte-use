import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useWebSocket } from './useWebSocket.svelte.js';

// ---------------------------------------------------------------------------
// Mock WebSocket
// ---------------------------------------------------------------------------

type WsEventType = 'open' | 'message' | 'error' | 'close';

class MockWebSocket {
	static readonly CONNECTING = 0;
	static readonly OPEN = 1;
	static readonly CLOSING = 2;
	static readonly CLOSED = 3;

	readonly CONNECTING = MockWebSocket.CONNECTING;
	readonly OPEN = MockWebSocket.OPEN;
	readonly CLOSING = MockWebSocket.CLOSING;
	readonly CLOSED = MockWebSocket.CLOSED;

	url: string;
	protocols: string | string[] | undefined;
	readyState: number = MockWebSocket.CONNECTING;

	onopen: ((ev: Event) => void) | null = null;
	onmessage: ((ev: MessageEvent) => void) | null = null;
	onerror: ((ev: Event) => void) | null = null;
	onclose: ((ev: CloseEvent) => void) | null = null;

	sentMessages: (string | ArrayBufferLike | Blob | ArrayBufferView)[] = [];

	static instances: MockWebSocket[] = [];

	constructor(url: string, protocols?: string | string[]) {
		this.url = url;
		this.protocols = protocols;
		MockWebSocket.instances.push(this);
	}

	send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
		this.sentMessages.push(data);
	}

	close() {
		this.readyState = MockWebSocket.CLOSED;
		if (this.onclose) {
			this.onclose(new CloseEvent('close'));
		}
	}

	// Helper: simulate events from the "server side"
	triggerOpen() {
		this.readyState = MockWebSocket.OPEN;
		if (this.onopen) this.onopen(new Event('open'));
	}

	triggerMessage(data: unknown) {
		if (this.onmessage) {
			this.onmessage(new MessageEvent('message', { data: JSON.stringify(data) }));
		}
	}

	triggerRawMessage(data: string) {
		if (this.onmessage) {
			this.onmessage(new MessageEvent('message', { data }));
		}
	}

	triggerError() {
		if (this.onerror) this.onerror(new Event('error'));
	}

	triggerClose() {
		this.readyState = MockWebSocket.CLOSED;
		if (this.onclose) this.onclose(new CloseEvent('close'));
	}
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
	MockWebSocket.instances = [];
	vi.useFakeTimers();
	vi.stubGlobal('WebSocket', MockWebSocket);
});

afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useWebSocket', () => {
	// -------------------------------------------------------------------------
	// Default behavior
	// -------------------------------------------------------------------------

	test('initial state when url is undefined', () => {
		const cleanup = $effect.root(() => {
			const { data, status, error } = useWebSocket(() => undefined);
			expect(data()).toBeNull();
			expect(status()).toBe('CLOSED');
			expect(error()).toBeNull();
		});
		cleanup();
	});

	test('opens a WebSocket connection when url is provided', () => {
		const cleanup = $effect.root(() => {
			const { status } = useWebSocket(() => 'wss://example.com');
			flushSync();
			expect(status()).toBe('CONNECTING');
			expect(MockWebSocket.instances).toHaveLength(1);
			expect(MockWebSocket.instances[0].url).toBe('wss://example.com');
		});
		cleanup();
	});

	test('status transitions to OPEN after server opens connection', () => {
		const cleanup = $effect.root(() => {
			const { status } = useWebSocket(() => 'wss://example.com');
			flushSync();
			MockWebSocket.instances[0].triggerOpen();
			flushSync();
			expect(status()).toBe('OPEN');
		});
		cleanup();
	});

	// -------------------------------------------------------------------------
	// Success case
	// -------------------------------------------------------------------------

	test('data is populated on message', () => {
		const cleanup = $effect.root(() => {
			const { data } = useWebSocket<{ id: number }>(() => 'wss://example.com');
			flushSync();
			MockWebSocket.instances[0].triggerOpen();
			MockWebSocket.instances[0].triggerMessage({ id: 42 });
			flushSync();
			expect(data()).toEqual({ id: 42 });
		});
		cleanup();
	});

	test('send() transmits data when OPEN', () => {
		const cleanup = $effect.root(() => {
			const { send } = useWebSocket(() => 'wss://example.com');
			flushSync();
			const ws = MockWebSocket.instances[0];
			ws.triggerOpen();
			send('hello');
			expect(ws.sentMessages).toContain('hello');
		});
		cleanup();
	});

	test('send() is a no-op when socket is not OPEN', () => {
		const cleanup = $effect.root(() => {
			const { send } = useWebSocket(() => 'wss://example.com');
			flushSync();
			// still CONNECTING
			send('ignored');
			expect(MockWebSocket.instances[0].sentMessages).toHaveLength(0);
		});
		cleanup();
	});

	test('passes protocols to WebSocket constructor', () => {
		const cleanup = $effect.root(() => {
			useWebSocket(() => 'wss://example.com', { protocols: ['chat'] });
			flushSync();
			expect(MockWebSocket.instances[0].protocols).toEqual(['chat']);
		});
		cleanup();
	});

	// -------------------------------------------------------------------------
	// Error case
	// -------------------------------------------------------------------------

	test('error is set when socket fires an error event', () => {
		const cleanup = $effect.root(() => {
			const { error } = useWebSocket(() => 'wss://example.com');
			flushSync();
			MockWebSocket.instances[0].triggerError();
			flushSync();
			expect(error()).toBeInstanceOf(Event);
		});
		cleanup();
	});

	test('status becomes CLOSED after server closes connection', () => {
		const cleanup = $effect.root(() => {
			const { status } = useWebSocket(() => 'wss://example.com');
			flushSync();
			MockWebSocket.instances[0].triggerOpen();
			MockWebSocket.instances[0].triggerClose();
			flushSync();
			expect(status()).toBe('CLOSED');
		});
		cleanup();
	});

	// -------------------------------------------------------------------------
	// Reactive update case
	// -------------------------------------------------------------------------

	test('reconnects when url changes', () => {
		let url = $state('wss://example.com/1');

		const cleanup = $effect.root(() => {
			useWebSocket(() => url);
			flushSync();
		});

		expect(MockWebSocket.instances).toHaveLength(1);
		expect(MockWebSocket.instances[0].url).toBe('wss://example.com/1');

		url = 'wss://example.com/2';
		flushSync();

		expect(MockWebSocket.instances).toHaveLength(2);
		expect(MockWebSocket.instances[1].url).toBe('wss://example.com/2');

		cleanup();
	});

	test('closes previous socket when url changes', () => {
		let url = $state('wss://example.com/1');

		const cleanup = $effect.root(() => {
			useWebSocket(() => url);
			flushSync();
		});

		const first = MockWebSocket.instances[0];
		first.triggerOpen();

		url = 'wss://example.com/2';
		flushSync();

		expect(first.readyState).toBe(MockWebSocket.CLOSED);
		cleanup();
	});

	test('status resets to CLOSED when url becomes undefined', () => {
		let url = $state<string | undefined>('wss://example.com');

		const cleanup = $effect.root(() => {
			const { status } = useWebSocket(() => url);
			flushSync();
			MockWebSocket.instances[0].triggerOpen();
			flushSync();
			expect(status()).toBe('OPEN');

			url = undefined;
			flushSync();
			expect(status()).toBe('CLOSED');
		});
		cleanup();
	});

	// -------------------------------------------------------------------------
	// Auto-reconnect
	// -------------------------------------------------------------------------

	test('auto-reconnects after unexpected close', async () => {
		const cleanup = $effect.root(() => {
			useWebSocket(() => 'wss://example.com', {
				autoReconnect: true,
				reconnectInterval: 500
			});
			flushSync();

			MockWebSocket.instances[0].triggerOpen();
			// Server closes unexpectedly
			MockWebSocket.instances[0].triggerClose();
			flushSync();

			// Before interval elapses only one instance
			expect(MockWebSocket.instances).toHaveLength(1);

			vi.advanceTimersByTime(500);

			// After interval a new socket is created
			expect(MockWebSocket.instances).toHaveLength(2);
		});
		cleanup();
	});

	test('does not auto-reconnect when close() is called explicitly', () => {
		const cleanup = $effect.root(() => {
			const { close } = useWebSocket(() => 'wss://example.com', {
				autoReconnect: true,
				reconnectInterval: 500
			});
			flushSync();

			MockWebSocket.instances[0].triggerOpen();
			close();
			flushSync();

			vi.advanceTimersByTime(1000);

			// No new socket after explicit close
			expect(MockWebSocket.instances).toHaveLength(1);
		});
		cleanup();
	});

	// -------------------------------------------------------------------------
	// close() method
	// -------------------------------------------------------------------------

	test('close() transitions status to CLOSED', () => {
		const cleanup = $effect.root(() => {
			const { status, close } = useWebSocket(() => 'wss://example.com');
			flushSync();
			MockWebSocket.instances[0].triggerOpen();
			flushSync();
			expect(status()).toBe('OPEN');

			close();
			flushSync();
			expect(status()).toBe('CLOSED');
		});
		cleanup();
	});

	// -------------------------------------------------------------------------
	// Cleanup behavior
	// -------------------------------------------------------------------------

	test('socket is closed when reactive scope is destroyed', () => {
		const cleanup = $effect.root(() => {
			useWebSocket(() => 'wss://example.com');
			flushSync();
			MockWebSocket.instances[0].triggerOpen();
		});

		const ws = MockWebSocket.instances[0];
		cleanup();

		expect(ws.readyState).toBe(MockWebSocket.CLOSED);
	});

	test('reconnect timer is cancelled when scope is destroyed', () => {
		const cleanup = $effect.root(() => {
			useWebSocket(() => 'wss://example.com', {
				autoReconnect: true,
				reconnectInterval: 1000
			});
			flushSync();

			MockWebSocket.instances[0].triggerOpen();
			MockWebSocket.instances[0].triggerClose();
			flushSync();

			// Destroy scope before reconnect timer fires
			cleanup();

			vi.advanceTimersByTime(1000);

			// No new socket should be created after scope is destroyed
			expect(MockWebSocket.instances).toHaveLength(1);
		});
	});

	test('message handlers are removed after socket is closed', () => {
		const cleanup = $effect.root(() => {
			useWebSocket<{ msg: string }>(() => 'wss://example.com');
			flushSync();
		});

		const ws = MockWebSocket.instances[0];
		cleanup();

		// Handlers should be nulled out
		expect(ws.onopen).toBeNull();
		expect(ws.onmessage).toBeNull();
		expect(ws.onerror).toBeNull();
		expect(ws.onclose).toBeNull();
	});

	// -------------------------------------------------------------------------
	// SSR safety
	// -------------------------------------------------------------------------

	test('does not throw when WebSocket is undefined (SSR)', () => {
		vi.stubGlobal('WebSocket', undefined);

		const cleanup = $effect.root(() => {
			expect(() => {
				useWebSocket(() => 'wss://example.com');
				flushSync();
			}).not.toThrow();
		});
		cleanup();
	});

	// -------------------------------------------------------------------------
	// Raw (non-JSON) message handling
	// -------------------------------------------------------------------------

	test('falls back to raw string when message is not valid JSON', () => {
		const cleanup = $effect.root(() => {
			const { data } = useWebSocket<string>(() => 'wss://example.com');
			flushSync();
			MockWebSocket.instances[0].triggerOpen();
			MockWebSocket.instances[0].triggerRawMessage('not-json');
			flushSync();
			expect(data()).toBe('not-json');
		});
		cleanup();
	});
});

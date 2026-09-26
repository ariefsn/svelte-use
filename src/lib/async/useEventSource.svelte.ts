import { parseMessageData } from './internal/parseMessageData.js';

/** Connection state of an `EventSource`. */
export type EventSourceStatus = 'CONNECTING' | 'OPEN' | 'CLOSED';

/** Options for `useEventSource`. */
export interface UseEventSourceOptions {
	/**
	 * Send cookies and HTTP auth to a cross-origin endpoint.
	 * @default false
	 */
	withCredentials?: boolean;
	/**
	 * Named events to subscribe to, in addition to the default unnamed one.
	 *
	 * A server sending `event: ping` delivers to `'ping'` and **not** to the
	 * default handler, so a named event not listed here is silently dropped.
	 * @default []
	 */
	events?: readonly string[];
	/**
	 * Connect as soon as the URL resolves. Set `false` to wait for `open()`.
	 * @default true
	 */
	immediate?: boolean;
}

/** Return value of `useEventSource`. */
export interface UseEventSourceReturn<T> {
	/** The last message payload, JSON-parsed when possible. `null` before the first message. */
	data: () => T | null;
	/** The name of the last event received — `'message'` for unnamed events. */
	event: () => string | null;
	/** The server's last `id:` field, which it uses to resume a dropped stream. */
	lastEventId: () => string | null;
	/** The current connection state. */
	status: () => EventSourceStatus;
	/** The last error event, or `null`. */
	error: () => Event | null;
	/** The underlying `EventSource`, for anything this does not wrap. */
	source: () => EventSource | null;
	/** Connects, if not already connected. */
	open: () => void;
	/** Closes the stream and stops the browser reconnecting. */
	close: () => void;
}

/**
 * Server-sent events with reactive state.
 *
 * Unlike a WebSocket this is one-way and text-only, and the **browser**
 * reconnects on its own when a connection drops — so there is deliberately no
 * `autoReconnect` option here. What the browser does not recover from is an
 * HTTP-level failure (a 404, or a response that is not `text/event-stream`):
 * that closes the stream for good, which surfaces as `status() === 'CLOSED'`
 * with a non-null `error()`.
 *
 * A server sending named events (`event: ping`) does **not** deliver them to
 * the default handler, so list the names in `events` or they are dropped.
 *
 * SSR: nothing connects, `status()` is `'CLOSED'`.
 *
 * @template T - Expected shape of a parsed message
 * @param url - Getter for the endpoint, or `undefined` to stay disconnected
 * @param options - Credentials, named events and connect-on-init behaviour
 * @returns Reactive stream state plus `open` and `close`
 *
 * @example
 * ```ts
 * const stream = useEventSource<{ price: number }>(() => '/api/ticker', {
 *   events: ['price', 'heartbeat']
 * });
 *
 * stream.status(); // → 'CONNECTING' | 'OPEN' | 'CLOSED'
 * stream.data();   // → { price: 42 } | null
 * stream.event();  // → 'price'
 * ```
 */
export function useEventSource<T = unknown>(
	url: () => string | undefined,
	options: UseEventSourceOptions = {}
): UseEventSourceReturn<T> {
	const { withCredentials = false, events = [], immediate = true } = options;

	let data = $state<T | null>(null);
	let event = $state<string | null>(null);
	let lastEventId = $state<string | null>(null);
	let status = $state<EventSourceStatus>('CLOSED');
	let error = $state<Event | null>(null);

	// Plain `let`: connection bookkeeping, never reactive.
	let source: EventSource | null = null;
	let explicitlyClosed = !immediate;

	function closeSource(): void {
		if (!source) return;
		source.close();
		source = null;
		status = 'CLOSED';
	}

	function handleMessage(name: string, message: MessageEvent<string>): void {
		event = name;
		lastEventId = message.lastEventId || null;
		data = parseMessageData<T>(message.data);
	}

	function openSource(resolvedUrl: string): void {
		// Resolved at call time, never captured at module scope, so a test can
		// stub `EventSource` before the composable is constructed.
		if (typeof EventSource === 'undefined') return;

		closeSource();

		status = 'CONNECTING';
		error = null;

		const es = new EventSource(resolvedUrl, { withCredentials });
		source = es;

		es.onopen = () => {
			// A late callback from a superseded connection must not write state.
			if (source !== es) return;
			status = 'OPEN';
			error = null;
		};

		es.onmessage = (message: MessageEvent<string>) => {
			if (source !== es) return;
			handleMessage('message', message);
		};

		es.onerror = (errorEvent: Event) => {
			if (source !== es) return;
			error = errorEvent;
			// readyState tells apart "the browser is retrying" from "this is
			// over" — EventSource reports CLOSED only for the fatal case.
			status = es.readyState === EventSource.CLOSED ? 'CLOSED' : 'CONNECTING';
		};

		for (const name of events) {
			es.addEventListener(name, (message) => {
				if (source !== es) return;
				handleMessage(name, message as MessageEvent<string>);
			});
		}
	}

	function open(): void {
		explicitlyClosed = false;
		const resolved = url();
		if (resolved !== undefined && !source) openSource(resolved);
	}

	function close(): void {
		explicitlyClosed = true;
		closeSource();
	}

	$effect(() => {
		const resolved = url();

		if (resolved === undefined || explicitlyClosed) {
			closeSource();
			return;
		}

		openSource(resolved);
	});

	// Dependency-free, so a re-run cannot tear down a stream just opened.
	$effect(() => () => closeSource());

	return {
		data: () => data,
		event: () => event,
		lastEventId: () => lastEventId,
		status: () => status,
		error: () => error,
		source: () => source,
		open,
		close
	};
}

import { parseMessageData } from './internal/parseMessageData.js';

export type WebSocketStatus = 'CONNECTING' | 'OPEN' | 'CLOSED';

export interface UseWebSocketOptions {
	/** WebSocket sub-protocol(s) passed to the `WebSocket` constructor. */
	protocols?: string | string[];
	/** Automatically attempt to reconnect when the socket closes unexpectedly. Default: `false`. */
	autoReconnect?: boolean;
	/**
	 * Milliseconds to wait before a reconnection attempt. Only relevant when `autoReconnect` is
	 * `true`. Default: `1000`.
	 */
	reconnectInterval?: number;
}

export interface UseWebSocketReturn<T> {
	/** Reactive getter returning the last deserialized message, or `null` before the first message. */
	data: () => T | null;
	/** Reactive getter returning the current connection status. */
	status: () => WebSocketStatus;
	/** Reactive getter returning the last connection error event, or `null` when no error has occurred. */
	error: () => Event | null;
	/** Send data through the WebSocket. No-ops when the socket is not `OPEN`. */
	send: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => void;
	/** Close the WebSocket connection and disable auto-reconnect for the current URL. */
	close: () => void;
}

/**
 * Reactive WebSocket with optional auto-reconnect, reactive URL changes and SSR safety.
 * Opens when a URL is provided and closes when the component is destroyed.
 */
export function useWebSocket<T = unknown>(
	url: () => string | undefined,
	options: UseWebSocketOptions = {}
): UseWebSocketReturn<T> {
	const { protocols, autoReconnect = false, reconnectInterval = 1000 } = options;

	let data = $state<T | null>(null);
	let status = $state<WebSocketStatus>('CLOSED');
	let error = $state<Event | null>(null);

	let socket: WebSocket | null = null;
	let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
	// Tracks whether close() was called explicitly so we do not auto-reconnect.
	let explicitlyClosed = false;

	function clearReconnectTimer() {
		if (reconnectTimer !== null) {
			clearTimeout(reconnectTimer);
			reconnectTimer = null;
		}
	}

	function closeSocket() {
		if (socket === null) return;
		const s = socket;
		socket = null;
		s.onopen = null;
		s.onclose = null;
		s.onerror = null;
		s.onmessage = null;
		if (s.readyState === WebSocket.OPEN || s.readyState === WebSocket.CONNECTING) {
			s.close();
		}
	}

	function openSocket(resolvedUrl: string) {
		// Guard: WebSocket is not available in SSR environments
		if (typeof WebSocket === 'undefined') return;

		closeSocket();
		clearReconnectTimer();

		status = 'CONNECTING';
		const ws = new WebSocket(resolvedUrl, protocols);
		socket = ws;

		ws.onopen = () => {
			if (socket !== ws) return;
			status = 'OPEN';
			error = null;
		};

		ws.onmessage = (event: MessageEvent) => {
			if (socket !== ws) return;
			data = parseMessageData<T>(event.data);
		};

		ws.onerror = (event: Event) => {
			if (socket !== ws) return;
			error = event;
		};

		ws.onclose = () => {
			if (socket !== ws) return;
			socket = null;
			status = 'CLOSED';

			if (autoReconnect && !explicitlyClosed) {
				reconnectTimer = setTimeout(() => {
					reconnectTimer = null;
					openSocket(resolvedUrl);
				}, reconnectInterval);
			}
		};
	}

	function send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
		if (socket !== null && socket.readyState === WebSocket.OPEN) {
			socket.send(data);
		}
	}

	function close() {
		explicitlyClosed = true;
		clearReconnectTimer();
		closeSocket();
		status = 'CLOSED';
	}

	$effect(() => {
		const resolvedUrl = url();

		explicitlyClosed = false;

		if (resolvedUrl === undefined) {
			closeSocket();
			clearReconnectTimer();
			status = 'CLOSED';
			return;
		}

		openSocket(resolvedUrl);

		return () => {
			explicitlyClosed = true;
			clearReconnectTimer();
			closeSocket();
		};
	});

	return {
		data: () => data,
		status: () => status,
		error: () => error,
		send,
		close
	};
}

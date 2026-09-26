import { useSupported } from '../browser/useSupported.svelte.js';

/** Options for `useBroadcastChannel`. */
export interface UseBroadcastChannelOptions {
	/**
	 * Channel name. Every context using the same name on the same origin
	 * shares the channel.
	 */
	name: string;
}

/** Return value of `useBroadcastChannel`. */
export interface UseBroadcastChannelReturn<T> {
	/** Whether `BroadcastChannel` exists in this browser. */
	isSupported: () => boolean;
	/** The last message received. `null` before the first one. */
	data: () => T | null;
	/** The last error — a `messageerror` fires when a payload could not be deserialised. */
	error: () => MessageEvent | null;
	/** Whether the channel is open. */
	isClosed: () => boolean;
	/** Posts to every **other** context on this channel. The sender never receives its own message. */
	post: (data: T) => void;
	/** Closes the channel. Further `post` calls are no-ops. */
	close: () => void;
}

/**
 * Cross-tab messaging over `BroadcastChannel`.
 *
 * Every tab, worker and iframe on the same origin that opens a channel with
 * the same name receives what the others post. The sender does **not** receive
 * its own message, which is the usual source of confusion when testing with a
 * single tab.
 *
 * Payloads travel by **structured clone**, not JSON: objects, `Map`, `Set`,
 * `Date`, `ArrayBuffer` and so on survive the trip, and a string arrives as
 * the string it was. That is why this deliberately does not run the JSON
 * parsing that `useWebSocket` and `useEventSource` share — doing so would
 * corrupt a payload that happens to look like JSON. Functions, DOM nodes and
 * class identity do not survive; posting one throws a `DataCloneError`.
 *
 * SSR: `isSupported()` is `false` and `post()` is a no-op.
 *
 * @template T - The message payload type
 * @param options - The channel name
 * @returns Reactive channel state plus `post` and `close`
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useBroadcastChannel } from '@ariefsn/svelte-use';
 *
 *   const channel = useBroadcastChannel<{ userId: string }>({ name: 'auth' });
 *
 *   // Another tab signing out reaches this one
 *   $effect(() => {
 *     if (channel.data()?.userId === null) goto('/login');
 *   });
 * </script>
 *
 * <button onclick={() => channel.post({ userId: 'u1' })}>Broadcast</button>
 * ```
 */
export function useBroadcastChannel<T = unknown>(
	options: UseBroadcastChannelOptions
): UseBroadcastChannelReturn<T> {
	const { name } = options;

	const isSupported = useSupported(() => typeof BroadcastChannel === 'function');

	let data = $state<T | null>(null);
	let error = $state<MessageEvent | null>(null);
	let isClosed = $state(false);

	// Plain `let`: the channel handle is not reactive state.
	let channel: BroadcastChannel | null = null;

	if (isSupported()) {
		channel = new BroadcastChannel(name);

		channel.onmessage = (message: MessageEvent<T>) => {
			// Structured clone already produced the value — no parsing.
			data = message.data;
		};

		channel.onmessageerror = (message: MessageEvent) => {
			error = message;
		};
	}

	function post(payload: T): void {
		if (!channel || isClosed) return;
		channel.postMessage(payload);
	}

	function close(): void {
		if (!channel || isClosed) return;
		channel.close();
		isClosed = true;
	}

	// Dependency-free: reading anything here would re-run and close the
	// channel that the previous run had just opened.
	$effect(() => () => {
		channel?.close();
		channel = null;
	});

	return {
		isSupported,
		data: () => data,
		error: () => error,
		isClosed: () => isClosed,
		post,
		close
	};
}

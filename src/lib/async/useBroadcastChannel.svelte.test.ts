import { flushSync } from 'svelte';
import { describe, expect, test } from 'vitest';
import { useBroadcastChannel } from './useBroadcastChannel.svelte.js';

/**
 * `BroadcastChannel` is real in Chromium, so these use it directly. The
 * sending channel object never receives its own message, so a test needs two
 * instances on the same name — which is also how two tabs behave.
 */

/**
 * Lets a posted message reach the other channel object.
 *
 * A single macrotask tick is not enough in this environment — delivery is
 * queued outside the page's task queue, so a real delay is needed. Verified:
 * with `setTimeout(0)` nothing arrives at all.
 */
async function delivered() {
	await new Promise((resolve) => setTimeout(resolve, 50));
	flushSync();
}

let counter = 0;
/** A fresh channel name per test, so parallel tests cannot cross-talk. */
const uniqueName = () => `use-broadcast-channel-test-${counter++}`;

describe('useBroadcastChannel', () => {
	test('receives what another context posts', async () => {
		const name = uniqueName();

		let receiver!: ReturnType<typeof useBroadcastChannel<{ userId: string }>>;
		let sender!: ReturnType<typeof useBroadcastChannel<{ userId: string }>>;
		const cleanup = $effect.root(() => {
			receiver = useBroadcastChannel<{ userId: string }>({ name });
			sender = useBroadcastChannel<{ userId: string }>({ name });
		});

		expect(receiver.data()).toBeNull();

		sender.post({ userId: 'u1' });
		await delivered();

		expect(receiver.data()).toEqual({ userId: 'u1' });

		cleanup();
	});

	test('the sender does not receive its own message', async () => {
		// The usual source of confusion when testing with a single tab.
		const name = uniqueName();

		let channel!: ReturnType<typeof useBroadcastChannel<string>>;
		const cleanup = $effect.root(() => {
			channel = useBroadcastChannel<string>({ name });
		});

		channel.post('hello');
		await delivered();

		expect(channel.data()).toBeNull();

		cleanup();
	});

	test('delivers structured data without JSON round-tripping', async () => {
		// The reason this does not share parseMessageData: a Map survives,
		// and a string payload stays the string it was.
		const name = uniqueName();

		let receiver!: ReturnType<typeof useBroadcastChannel<Map<string, number>>>;
		let sender!: ReturnType<typeof useBroadcastChannel<Map<string, number>>>;
		const cleanup = $effect.root(() => {
			receiver = useBroadcastChannel<Map<string, number>>({ name });
			sender = useBroadcastChannel<Map<string, number>>({ name });
		});

		sender.post(new Map([['a', 1]]));
		await delivered();

		expect(receiver.data()).toBeInstanceOf(Map);
		expect(receiver.data()?.get('a')).toBe(1);

		cleanup();
	});

	test('does not JSON-parse a string that looks like JSON', async () => {
		const name = uniqueName();

		let receiver!: ReturnType<typeof useBroadcastChannel<string>>;
		let sender!: ReturnType<typeof useBroadcastChannel<string>>;
		const cleanup = $effect.root(() => {
			receiver = useBroadcastChannel<string>({ name });
			sender = useBroadcastChannel<string>({ name });
		});

		sender.post('{"a":1}');
		await delivered();

		// A JSON-parsing transport would hand back an object here, corrupting
		// a payload the sender meant literally.
		expect(receiver.data()).toBe('{"a":1}');

		cleanup();
	});

	test('close() stops delivery and marks the channel closed', async () => {
		const name = uniqueName();

		let receiver!: ReturnType<typeof useBroadcastChannel<string>>;
		let sender!: ReturnType<typeof useBroadcastChannel<string>>;
		const cleanup = $effect.root(() => {
			receiver = useBroadcastChannel<string>({ name });
			sender = useBroadcastChannel<string>({ name });
		});

		expect(receiver.isClosed()).toBe(false);
		receiver.close();
		flushSync();
		expect(receiver.isClosed()).toBe(true);

		sender.post('after close');
		await delivered();

		expect(receiver.data()).toBeNull();

		cleanup();
	});

	test('post() after close() is a no-op rather than a throw', async () => {
		const name = uniqueName();

		let channel!: ReturnType<typeof useBroadcastChannel<string>>;
		const cleanup = $effect.root(() => {
			channel = useBroadcastChannel<string>({ name });
		});

		channel.close();
		expect(() => channel.post('ignored')).not.toThrow();

		cleanup();
	});

	test('reports support', () => {
		const cleanup = $effect.root(() => {
			const channel = useBroadcastChannel<string>({ name: uniqueName() });
			expect(channel.isSupported()).toBe(true);
		});
		cleanup();
	});
});

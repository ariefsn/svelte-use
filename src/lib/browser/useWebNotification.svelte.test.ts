import { afterEach, describe, expect, test, vi } from 'vitest';
import { flushSync } from 'svelte';
import { useWebNotification } from './useWebNotification.svelte.js';

/** Stands in for the real API, which headless Chromium reports as `denied`. */
class FakeNotification {
	static permission: NotificationPermission = 'granted';
	static requestPermission = vi.fn(async (): Promise<NotificationPermission> => 'granted');
	static instances: FakeNotification[] = [];
	static throwOnConstruct: Error | null = null;

	readonly close = vi.fn();

	constructor(
		readonly title: string,
		readonly options?: NotificationOptions
	) {
		if (FakeNotification.throwOnConstruct) throw FakeNotification.throwOnConstruct;
		FakeNotification.instances.push(this);
	}
}

function stubNotification(permission: NotificationPermission = 'granted') {
	FakeNotification.permission = permission;
	FakeNotification.instances = [];
	FakeNotification.throwOnConstruct = null;
	FakeNotification.requestPermission = vi.fn(async () => 'granted' as NotificationPermission);
	vi.stubGlobal('Notification', FakeNotification);
}

/** Mounts the composable so the teardown effect is registered. */
function mount(options?: Parameters<typeof useWebNotification>[0]) {
	let api!: ReturnType<typeof useWebNotification>;
	const stop = $effect.root(() => {
		api = useWebNotification(options);
	});
	flushSync();
	return { api, stop };
}

describe('useWebNotification', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	test('detects support', () => {
		const cleanup = $effect.root(() => {
			const { isSupported } = useWebNotification();
			expect(typeof isSupported()).toBe('boolean');
		});
		cleanup();
	});

	test('starts with no notification', () => {
		const cleanup = $effect.root(() => {
			const { notification, error } = useWebNotification({ autoRequestPermission: false });
			expect(notification()).toBeNull();
			expect(error()).toBeNull();
		});
		cleanup();
	});

	test('close does not throw when no notification', () => {
		const cleanup = $effect.root(() => {
			const { close } = useWebNotification({ autoRequestPermission: false });
			expect(() => close()).not.toThrow();
		});
		cleanup();
	});

	test('reports an error when the API is missing', async () => {
		const descriptor = Object.getOwnPropertyDescriptor(window, 'Notification');
		// @ts-expect-error removing the global is the only way to make the feature probe fail
		delete window.Notification;
		try {
			const { api, stop } = mount();
			expect(api.isSupported()).toBe(false);
			await expect(api.show()).resolves.toBeNull();
			expect(api.error()?.message).toMatch(/not supported/i);
			stop();
		} finally {
			if (descriptor) Object.defineProperty(window, 'Notification', descriptor);
		}
	});

	test('requests permission on creation when it is undecided', () => {
		stubNotification('default');
		const { stop } = mount();
		expect(FakeNotification.requestPermission).toHaveBeenCalledOnce();
		stop();
	});

	test('does not request permission when asked not to', () => {
		stubNotification('default');
		const { api, stop } = mount({ autoRequestPermission: false });
		expect(FakeNotification.requestPermission).not.toHaveBeenCalled();
		expect(api.isPermissionGranted()).toBe(false);
		stop();
	});

	test('shows a notification once permission is granted', async () => {
		stubNotification('granted');
		const { api, stop } = mount({ title: 'Hello', body: 'World' });
		const n = await api.show();
		expect(n).not.toBeNull();
		expect(api.notification()).toBe(n);
		expect(api.error()).toBeNull();
		expect(FakeNotification.instances[0].title).toBe('Hello');
		expect(FakeNotification.instances[0].options?.body).toBe('World');
		stop();
	});

	test('show overrides win over the options given at creation', async () => {
		stubNotification('granted');
		const { api, stop } = mount({ title: 'Original', body: 'Base' });
		await api.show({ title: 'Override' });
		expect(FakeNotification.instances[0].title).toBe('Override');
		expect(FakeNotification.instances[0].options?.body).toBe('Base');
		stop();
	});

	test('falls back to an empty title', async () => {
		stubNotification('granted');
		const { api, stop } = mount();
		await api.show();
		expect(FakeNotification.instances[0].title).toBe('');
		stop();
	});

	test('asks for permission on show when it is still undecided', async () => {
		stubNotification('default');
		const { api, stop } = mount({ autoRequestPermission: false });
		const n = await api.show();
		expect(FakeNotification.requestPermission).toHaveBeenCalled();
		expect(api.isPermissionGranted()).toBe(true);
		expect(n).not.toBeNull();
		stop();
	});

	test('reports an error when permission is denied', async () => {
		stubNotification('denied');
		const { api, stop } = mount({ autoRequestPermission: false });
		await expect(api.show()).resolves.toBeNull();
		expect(api.error()?.message).toMatch(/"denied", not "granted"/);
		expect(api.notification()).toBeNull();
		stop();
	});

	test('re-reads a permission that was granted after creation', async () => {
		stubNotification('denied');
		const { api, stop } = mount({ autoRequestPermission: false });
		expect(api.isPermissionGranted()).toBe(false);

		FakeNotification.permission = 'granted';
		await api.show();
		expect(api.isPermissionGranted()).toBe(true);
		expect(api.notification()).not.toBeNull();
		stop();
	});

	test('captures a constructor failure instead of throwing', async () => {
		stubNotification('granted');
		FakeNotification.throwOnConstruct = new TypeError('illegal constructor');
		const { api, stop } = mount();
		await expect(api.show()).resolves.toBeNull();
		expect(api.error()).toBeInstanceOf(TypeError);
		expect(api.error()?.message).toBe('illegal constructor');
		stop();
	});

	test('showing again closes the previous notification', async () => {
		stubNotification('granted');
		const { api, stop } = mount();
		const first = await api.show({ title: 'first' });
		await api.show({ title: 'second' });
		expect(FakeNotification.instances[0].close).toHaveBeenCalledOnce();
		expect(api.notification()).not.toBe(first);
		stop();
	});

	test('an explicit close releases the notification', async () => {
		stubNotification('granted');
		const { api, stop } = mount();
		await api.show();
		api.close();
		expect(FakeNotification.instances[0].close).toHaveBeenCalledOnce();
		expect(api.notification()).toBeNull();
		stop();
	});

	test('scope destroy closes the active notification', async () => {
		stubNotification('granted');
		const { api, stop } = mount();
		await api.show();
		stop();
		expect(FakeNotification.instances[0].close).toHaveBeenCalledOnce();
	});

	test('an explicit close is not repeated on destroy', async () => {
		stubNotification('granted');
		const { api, stop } = mount();
		await api.show();
		api.close();
		stop();
		expect(FakeNotification.instances[0].close).toHaveBeenCalledOnce();
	});
});

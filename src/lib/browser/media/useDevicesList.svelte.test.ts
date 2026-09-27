import { flushSync, tick } from 'svelte';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { useDevicesList } from './useDevicesList.svelte.js';

/** Headless Chromium reports no real capture hardware, so `enumerateDevices` is stubbed. */

function device(kind: MediaDeviceKind, label: string, deviceId = `${kind}:${label}`) {
	return {
		deviceId,
		kind,
		label,
		groupId: 'group',
		toJSON: () => ({ deviceId, kind, label, groupId: 'group' })
	} as MediaDeviceInfo;
}

/** Lets the composable's async `update()` settle before assertions. */
async function settle() {
	flushSync();
	await tick();
	await Promise.resolve();
	flushSync();
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe('useDevicesList', () => {
	test('enumerates and groups devices by kind', async () => {
		vi.spyOn(navigator.mediaDevices, 'enumerateDevices').mockResolvedValue([
			device('videoinput', 'Camera'),
			device('audioinput', 'Mic'),
			device('audiooutput', 'Speakers')
		]);

		let devices!: ReturnType<typeof useDevicesList>;
		const cleanup = $effect.root(() => {
			devices = useDevicesList();
		});

		await settle();

		expect(devices.devices()).toHaveLength(3);
		expect(devices.videoInputs().map((d) => d.label)).toEqual(['Camera']);
		expect(devices.audioInputs().map((d) => d.label)).toEqual(['Mic']);
		expect(devices.audioOutputs().map((d) => d.label)).toEqual(['Speakers']);

		cleanup();
	});

	test('reports permission as not granted while labels are blank', async () => {
		// This is the state a naive device picker renders as a list of blanks.
		vi.spyOn(navigator.mediaDevices, 'enumerateDevices').mockResolvedValue([
			device('videoinput', ''),
			device('audioinput', '')
		]);

		let devices!: ReturnType<typeof useDevicesList>;
		const cleanup = $effect.root(() => {
			devices = useDevicesList();
		});

		await settle();

		expect(devices.devices()).toHaveLength(2);
		expect(devices.permissionGranted()).toBe(false);

		cleanup();
	});

	test('ensurePermissions opens a throwaway stream and re-enumerates', async () => {
		const stop = vi.fn();
		const stream = { getTracks: () => [{ stop }] } as unknown as MediaStream;
		const getUserMedia = vi.spyOn(navigator.mediaDevices, 'getUserMedia').mockResolvedValue(stream);

		const enumerateDevices = vi
			.spyOn(navigator.mediaDevices, 'enumerateDevices')
			.mockResolvedValue([device('videoinput', '')]);

		let devices!: ReturnType<typeof useDevicesList>;
		const cleanup = $effect.root(() => {
			devices = useDevicesList();
		});

		await settle();
		expect(devices.permissionGranted()).toBe(false);

		// Labels appear once access is granted.
		enumerateDevices.mockResolvedValue([device('videoinput', 'Camera')]);
		expect(await devices.ensurePermissions()).toBe(true);
		await settle();

		expect(getUserMedia).toHaveBeenCalledTimes(1);
		// The stream was only ever a means to read labels.
		expect(stop).toHaveBeenCalledTimes(1);
		expect(devices.permissionGranted()).toBe(true);
		expect(devices.videoInputs()[0].label).toBe('Camera');

		cleanup();
	});

	test('ensurePermissions resolves false when access is denied', async () => {
		vi.spyOn(navigator.mediaDevices, 'enumerateDevices').mockResolvedValue([
			device('videoinput', '')
		]);
		vi.spyOn(navigator.mediaDevices, 'getUserMedia').mockRejectedValue(
			new DOMException('Permission denied', 'NotAllowedError')
		);

		let devices!: ReturnType<typeof useDevicesList>;
		const cleanup = $effect.root(() => {
			devices = useDevicesList();
		});

		await settle();
		expect(await devices.ensurePermissions()).toBe(false);
		expect(devices.permissionGranted()).toBe(false);

		cleanup();
	});

	test('re-enumerates on devicechange', async () => {
		// Relies on the widened useEventListener overload: navigator.mediaDevices
		// is not a Window, Document or HTMLElement.
		const enumerateDevices = vi
			.spyOn(navigator.mediaDevices, 'enumerateDevices')
			.mockResolvedValue([device('audioinput', 'Built-in Mic')]);

		let devices!: ReturnType<typeof useDevicesList>;
		const cleanup = $effect.root(() => {
			devices = useDevicesList();
		});

		await settle();
		expect(devices.devices()).toHaveLength(1);

		enumerateDevices.mockResolvedValue([
			device('audioinput', 'Built-in Mic'),
			device('audioinput', 'Headset')
		]);
		navigator.mediaDevices.dispatchEvent(new Event('devicechange'));
		await settle();

		expect(devices.devices()).toHaveLength(2);
		expect(devices.audioInputs().map((d) => d.label)).toEqual(['Built-in Mic', 'Headset']);

		cleanup();
	});

	test('survives enumerateDevices rejecting', async () => {
		vi.spyOn(navigator.mediaDevices, 'enumerateDevices').mockRejectedValue(
			new DOMException('Blocked by permissions policy', 'NotAllowedError')
		);

		let devices!: ReturnType<typeof useDevicesList>;
		const cleanup = $effect.root(() => {
			devices = useDevicesList();
		});

		await settle();

		expect(devices.devices()).toEqual([]);
		expect(devices.permissionGranted()).toBe(false);

		cleanup();
	});

	test('reports unsupported when mediaDevices is absent', async () => {
		const original = Object.getOwnPropertyDescriptor(navigator, 'mediaDevices');
		Object.defineProperty(navigator, 'mediaDevices', { value: undefined, configurable: true });

		try {
			let devices!: ReturnType<typeof useDevicesList>;
			const cleanup = $effect.root(() => {
				devices = useDevicesList();
			});

			await settle();

			expect(devices.isSupported()).toBe(false);
			expect(devices.devices()).toEqual([]);
			expect(await devices.ensurePermissions()).toBe(false);

			cleanup();
		} finally {
			if (original) Object.defineProperty(navigator, 'mediaDevices', original);
		}
	});
});

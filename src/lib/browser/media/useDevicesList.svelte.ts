import { untrack } from 'svelte';
import { useEventListener } from '../useEventListener.svelte.js';
import { useSupported } from '../useSupported.svelte.js';
import {
	getMediaDevices,
	groupDevices,
	hasDeviceLabels,
	stopStream
} from './internal/mediaDevices.js';

/** Options for `useDevicesList`. */
export interface UseDevicesListOptions {
	/**
	 * Ask for device access on init so labels are populated immediately.
	 *
	 * This shows a permission prompt, so leave it off unless the component
	 * only renders after a user action.
	 * @default false
	 */
	requestPermissions?: boolean;
	/**
	 * Constraints for the throwaway stream used to reveal labels.
	 * @default { audio: true, video: true }
	 */
	constraints?: MediaStreamConstraints;
}

/** Return value of `useDevicesList`. */
export interface UseDevicesListReturn {
	/** Whether `enumerateDevices` exists in this browser. */
	isSupported: () => boolean;
	/** Every device reported, in the browser's order. */
	devices: () => readonly MediaDeviceInfo[];
	/** Microphones and other audio sources. */
	audioInputs: () => readonly MediaDeviceInfo[];
	/** Speakers and other audio sinks. */
	audioOutputs: () => readonly MediaDeviceInfo[];
	/** Cameras. */
	videoInputs: () => readonly MediaDeviceInfo[];
	/** Whether labels are populated, i.e. access has been granted. */
	permissionGranted: () => boolean;
	/** Requests access so labels become readable. Resolves whether it worked. */
	ensurePermissions: () => Promise<boolean>;
	/** Re-enumerates devices. Called automatically on `devicechange`. */
	update: () => Promise<void>;
}

/**
 * The list of media input and output devices, kept current.
 *
 * `enumerateDevices()` always resolves, but until the user grants access every
 * entry has an empty `label` — so a device picker built on it shows a list of
 * blanks. `permissionGranted()` reports that state and `ensurePermissions()`
 * resolves it by opening a stream purely to reveal the labels and stopping it
 * again immediately.
 *
 * The list is refreshed on `devicechange`, so plugging in a headset updates it
 * without a reload.
 *
 * SSR: `isSupported()` is `false` and the lists are empty.
 *
 * @param options - Permission behaviour for the initial enumeration
 * @returns The grouped device lists plus `update` and `ensurePermissions`
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useDevicesList } from '@ariefsn/svelte-use';
 *
 *   const devices = useDevicesList();
 * </script>
 *
 * {#if !devices.permissionGranted()}
 *   <button onclick={devices.ensurePermissions}>Show device names</button>
 * {/if}
 * <ul>
 *   {#each devices.videoInputs() as camera (camera.deviceId)}
 *     <li>{camera.label || 'Camera'}</li>
 *   {/each}
 * </ul>
 * ```
 */
export function useDevicesList(options: UseDevicesListOptions = {}): UseDevicesListReturn {
	const { requestPermissions = false, constraints = { audio: true, video: true } } = options;

	const isSupported = useSupported(() => {
		const devices = getMediaDevices();
		return devices !== null && typeof devices.enumerateDevices === 'function';
	});

	let devices = $state<readonly MediaDeviceInfo[]>([]);

	const grouped = $derived(groupDevices(devices));
	const permissionGranted = $derived(hasDeviceLabels(devices));

	async function update(): Promise<void> {
		const mediaDevices = getMediaDevices();
		if (!isSupported() || !mediaDevices) return;

		try {
			devices = await mediaDevices.enumerateDevices();
		} catch {
			// Enumeration can reject in a cross-origin iframe without the
			// right permissions policy; an empty list is the honest answer.
			devices = [];
		}
	}

	async function ensurePermissions(): Promise<boolean> {
		const mediaDevices = getMediaDevices();
		if (!isSupported() || !mediaDevices) return false;
		if (untrack(() => permissionGranted)) return true;

		try {
			// The stream itself is not wanted — opening one is just how the
			// spec makes labels readable. Stop it before anything can use it.
			stopStream(await mediaDevices.getUserMedia(constraints));
			await update();
			return true;
		} catch {
			return false;
		}
	}

	$effect(() => {
		if (!isSupported()) return;
		if (requestPermissions) void ensurePermissions();
		else void update();
	});

	// `navigator.mediaDevices` is not a Window/Document/HTMLElement, so this
	// relies on the widened `useEventListener` overload.
	useEventListener(
		() => getMediaDevices(),
		'devicechange',
		() => void update()
	);

	return {
		isSupported,
		devices: () => devices,
		audioInputs: () => grouped.audioInputs,
		audioOutputs: () => grouped.audioOutputs,
		videoInputs: () => grouped.videoInputs,
		permissionGranted: () => permissionGranted,
		ensurePermissions,
		update
	};
}

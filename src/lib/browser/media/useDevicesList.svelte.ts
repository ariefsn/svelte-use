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
	/** Ask for device access on init so labels are populated immediately. Default `false`. */
	requestPermissions?: boolean;
	/**
	 * Constraints for the throwaway stream used to reveal labels. Default `{ audio: true, video: true
	 * }`.
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

/** The list of media input and output devices, grouped by kind and refreshed on `devicechange`. */
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

/**
 * Shared, rune-free helpers for the `MediaDevices` composables.
 *
 * Kept as a plain `.ts` so it can be unit-tested in the fast node project and
 * imported from anywhere; nothing here touches reactive state.
 */

/**
 * The `MediaDevices` interface, or `null` when it is unavailable.
 *
 * Resolved at call time rather than captured at module scope, so tests can
 * stub `navigator.mediaDevices` before constructing a composable.
 */
export function getMediaDevices(): MediaDevices | null {
	if (typeof navigator === 'undefined') return null;
	return navigator.mediaDevices ?? null;
}

/**
 * Stops every track on a stream.
 *
 * A stream stays live — and the camera light stays on — until each individual
 * track is stopped; releasing the `MediaStream` reference alone does nothing.
 */
export function stopStream(stream: MediaStream | null | undefined): void {
	if (!stream) return;
	for (const track of stream.getTracks()) {
		track.stop();
	}
}

/**
 * Whether the browser has revealed device labels.
 *
 * `enumerateDevices()` always resolves, but until the user has granted access
 * to a device of that kind it returns entries whose `label` is an empty
 * string. That is the only portable signal for "enumerated, but not yet
 * permitted", so it is what drives a `requestPermissions()` flow.
 */
export function hasDeviceLabels(devices: readonly MediaDeviceInfo[]): boolean {
	return devices.length > 0 && devices.every((device) => device.label !== '');
}

/** Devices split by kind. */
export interface GroupedDevices {
	audioInputs: readonly MediaDeviceInfo[];
	audioOutputs: readonly MediaDeviceInfo[];
	videoInputs: readonly MediaDeviceInfo[];
}

/**
 * Splits a device list by `kind`.
 *
 * One pass rather than three `filter` calls, since every consumer wants all
 * three groups.
 */
export function groupDevices(devices: readonly MediaDeviceInfo[]): GroupedDevices {
	const audioInputs: MediaDeviceInfo[] = [];
	const audioOutputs: MediaDeviceInfo[] = [];
	const videoInputs: MediaDeviceInfo[] = [];

	for (const device of devices) {
		if (device.kind === 'audioinput') audioInputs.push(device);
		else if (device.kind === 'audiooutput') audioOutputs.push(device);
		else if (device.kind === 'videoinput') videoInputs.push(device);
	}

	return { audioInputs, audioOutputs, videoInputs };
}

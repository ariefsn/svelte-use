/** Shared, rune-free helpers for the `MediaDevices` composables. */

/** The `MediaDevices` interface, or `null` when it is unavailable. */
export function getMediaDevices(): MediaDevices | null {
	if (typeof navigator === 'undefined') return null;
	return navigator.mediaDevices ?? null;
}

/** Stops every track on a stream. */
export function stopStream(stream: MediaStream | null | undefined): void {
	if (!stream) return;
	for (const track of stream.getTracks()) {
		track.stop();
	}
}

/** Whether the browser has revealed device labels. */
export function hasDeviceLabels(devices: readonly MediaDeviceInfo[]): boolean {
	return devices.length > 0 && devices.every((device) => device.label !== '');
}

/** Devices split by kind. */
export interface GroupedDevices {
	audioInputs: readonly MediaDeviceInfo[];
	audioOutputs: readonly MediaDeviceInfo[];
	videoInputs: readonly MediaDeviceInfo[];
}

/** Splits a device list by `kind`. */
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

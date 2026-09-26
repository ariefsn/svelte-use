import { describe, expect, it, vi } from 'vitest';
import { getMediaDevices, groupDevices, hasDeviceLabels, stopStream } from './mediaDevices.js';

/** A minimal `MediaDeviceInfo`; the helpers only read `kind` and `label`. */
function device(kind: MediaDeviceKind, label: string, deviceId = label): MediaDeviceInfo {
	return {
		deviceId,
		kind,
		label,
		groupId: 'group',
		toJSON: () => ({ deviceId, kind, label, groupId: 'group' })
	};
}

describe('groupDevices', () => {
	it('splits a list by kind', () => {
		const grouped = groupDevices([
			device('videoinput', 'Camera'),
			device('audioinput', 'Mic'),
			device('audiooutput', 'Speakers'),
			device('videoinput', 'Webcam')
		]);

		expect(grouped.videoInputs.map((d) => d.label)).toEqual(['Camera', 'Webcam']);
		expect(grouped.audioInputs.map((d) => d.label)).toEqual(['Mic']);
		expect(grouped.audioOutputs.map((d) => d.label)).toEqual(['Speakers']);
	});

	it('returns empty groups for an empty list', () => {
		const grouped = groupDevices([]);
		expect(grouped.videoInputs).toEqual([]);
		expect(grouped.audioInputs).toEqual([]);
		expect(grouped.audioOutputs).toEqual([]);
	});
});

describe('hasDeviceLabels', () => {
	it('is false when labels are blank, which is the un-permitted state', () => {
		expect(hasDeviceLabels([device('videoinput', ''), device('audioinput', '')])).toBe(false);
	});

	it('is false when only some labels are populated', () => {
		expect(hasDeviceLabels([device('videoinput', 'Camera'), device('audioinput', '')])).toBe(false);
	});

	it('is true once every label is populated', () => {
		expect(hasDeviceLabels([device('videoinput', 'Camera'), device('audioinput', 'Mic')])).toBe(
			true
		);
	});

	it('is false for an empty list rather than vacuously true', () => {
		// `every` on [] is true, which would report permission granted before
		// anything had been enumerated.
		expect(hasDeviceLabels([])).toBe(false);
	});
});

describe('stopStream', () => {
	it('stops every track', () => {
		const stop = vi.fn();
		const stream = {
			getTracks: () => [{ stop }, { stop }]
		} as unknown as MediaStream;

		stopStream(stream);
		expect(stop).toHaveBeenCalledTimes(2);
	});

	it('ignores null and undefined', () => {
		expect(() => stopStream(null)).not.toThrow();
		expect(() => stopStream(undefined)).not.toThrow();
	});
});

describe('getMediaDevices', () => {
	it('returns null when navigator has no mediaDevices', () => {
		// The node project has no `navigator.mediaDevices`, which is the same
		// shape as SSR — the composables must not throw there.
		expect(getMediaDevices()).toBeNull();
	});
});

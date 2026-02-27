import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useGeolocation } from './useGeolocation.svelte.js';

type PositionCallback = (position: GeolocationPosition) => void;
type ErrorCallback = (error: GeolocationPositionError) => void;

function makeCoords(overrides: Partial<GeolocationCoordinates> = {}): GeolocationCoordinates {
	return {
		latitude: overrides.latitude ?? 51.5074,
		longitude: overrides.longitude ?? -0.1278,
		accuracy: overrides.accuracy ?? 10,
		altitude: overrides.altitude ?? null,
		altitudeAccuracy: overrides.altitudeAccuracy ?? null,
		heading: overrides.heading ?? null,
		speed: overrides.speed ?? null,
		toJSON() {
			return this;
		}
	};
}

describe('useGeolocation', () => {
	let watchCallback: PositionCallback | null = null;
	let watchErrorCallback: ErrorCallback | null = null;
	let watchIdCounter = 0;
	let originalGeolocation: Geolocation;

	beforeEach(() => {
		originalGeolocation = navigator.geolocation;
		watchCallback = null;
		watchErrorCallback = null;

		const mockGeolocation = {
			watchPosition: vi.fn((success: PositionCallback, error?: ErrorCallback) => {
				watchCallback = success;
				watchErrorCallback = error ?? null;
				return ++watchIdCounter;
			}),
			clearWatch: vi.fn(),
			getCurrentPosition: vi.fn()
		};

		Object.defineProperty(navigator, 'geolocation', {
			value: mockGeolocation,
			writable: true,
			configurable: true
		});
	});

	afterEach(() => {
		Object.defineProperty(navigator, 'geolocation', {
			value: originalGeolocation,
			writable: true,
			configurable: true
		});
	});

	test('coords starts as null', () => {
		const cleanup = $effect.root(() => {
			const { coords } = useGeolocation();
			expect(coords()).toBeNull();
		});
		cleanup();
	});

	test('error starts as null', () => {
		const cleanup = $effect.root(() => {
			const { error } = useGeolocation();
			expect(error()).toBeNull();
		});
		cleanup();
	});

	test('coords updates when position is received', () => {
		const cleanup = $effect.root(() => {
			const { coords, error } = useGeolocation();
			flushSync();

			const mockCoords = makeCoords({ latitude: 40.7128, longitude: -74.006 });
			watchCallback!({ coords: mockCoords, timestamp: Date.now() } as GeolocationPosition);
			flushSync();

			expect(coords()?.latitude).toBe(40.7128);
			expect(coords()?.longitude).toBe(-74.006);
			expect(error()).toBeNull();
		});
		cleanup();
	});

	test('error updates when position fails', () => {
		const cleanup = $effect.root(() => {
			const { coords, error } = useGeolocation();
			flushSync();

			const mockError = {
				code: 1,
				message: 'User denied Geolocation',
				PERMISSION_DENIED: 1,
				POSITION_UNAVAILABLE: 2,
				TIMEOUT: 3
			} as GeolocationPositionError;

			watchErrorCallback!(mockError);
			flushSync();

			expect(error()?.code).toBe(1);
			expect(coords()).toBeNull();
		});
		cleanup();
	});

	test('error clears after a successful position fix', () => {
		const cleanup = $effect.root(() => {
			const { coords, error } = useGeolocation();
			flushSync();

			const mockError = {
				code: 2,
				message: 'Position unavailable',
				PERMISSION_DENIED: 1,
				POSITION_UNAVAILABLE: 2,
				TIMEOUT: 3
			} as GeolocationPositionError;

			watchErrorCallback!(mockError);
			flushSync();
			expect(error()).not.toBeNull();

			watchCallback!({
				coords: makeCoords(),
				timestamp: Date.now()
			} as GeolocationPosition);
			flushSync();

			expect(error()).toBeNull();
			expect(coords()).not.toBeNull();
		});
		cleanup();
	});

	test('clearWatch is called on cleanup', () => {
		const cleanup = $effect.root(() => {
			useGeolocation();
			flushSync();
		});

		cleanup();
		flushSync();

		expect(navigator.geolocation.clearWatch).toHaveBeenCalled();
	});

	test('passes options to watchPosition', () => {
		const options: PositionOptions = { enableHighAccuracy: true, timeout: 5000 };

		const cleanup = $effect.root(() => {
			useGeolocation(options);
			flushSync();
		});

		expect(navigator.geolocation.watchPosition).toHaveBeenCalledWith(
			expect.any(Function),
			expect.any(Function),
			options
		);

		cleanup();
	});
});

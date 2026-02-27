/**
 * Shape of the return value from {@link useGeolocation}.
 */
export interface UseGeolocationReturn {
	/** Getter for the latest coordinates snapshot, or `null` before the first fix. */
	coords: () => GeolocationCoordinates | null;
	/** Getter for the last geolocation error, or `null` when there is none. */
	error: () => GeolocationPositionError | null;
	/** Getter for whether the Geolocation API is supported in this environment. */
	isSupported: () => boolean;
}

/**
 * Reactive Geolocation API wrapper.
 *
 * Calls `navigator.geolocation.watchPosition` and keeps `coords` updated
 * as the device position changes. `error` is set when the API reports a
 * failure. Both are `null` until the first response arrives.
 *
 * The watcher is cleared automatically when the reactive scope is
 * destroyed. Safe to call during SSR – `isSupported` will return `false`
 * and no browser APIs will be accessed.
 *
 * @param options - Standard `PositionOptions` forwarded to `watchPosition`.
 * @returns An object with `coords`, `error`, and `isSupported` getter functions.
 *
 * @example
 * ```ts
 * const { coords, error, isSupported } = useGeolocation({ enableHighAccuracy: true });
 * isSupported(); // true
 * coords();      // GeolocationCoordinates | null
 * ```
 */
export function useGeolocation(options?: PositionOptions): UseGeolocationReturn {
	const isBrowser = typeof navigator !== 'undefined';
	const supported = isBrowser && 'geolocation' in navigator;

	let coords = $state<GeolocationCoordinates | null>(null);
	let error = $state<GeolocationPositionError | null>(null);

	$effect(() => {
		if (!supported) return;

		const watchId = navigator.geolocation.watchPosition(
			(position) => {
				coords = position.coords;
				error = null;
			},
			(err) => {
				error = err;
			},
			options
		);

		return () => navigator.geolocation.clearWatch(watchId);
	});

	return {
		coords: () => coords,
		error: () => error,
		isSupported: () => supported
	};
}

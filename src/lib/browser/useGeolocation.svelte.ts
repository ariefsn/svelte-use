/**
 * Return value of {@link useGeolocation}.
 */
export interface UseGeolocationReturn {
	/** Getter for the latest coordinates snapshot, or `null` before the first fix. */
	coords: () => GeolocationCoordinates | null;
	/** Getter for the last geolocation error, or `null` when there is none. */
	error: () => GeolocationPositionError | null;
}

/**
 * Reactive Geolocation API wrapper.
 *
 * Calls `navigator.geolocation.watchPosition` and keeps `coords` updated
 * as the device position changes. `error` is populated when the API
 * reports a failure, and is cleared on the next successful fix. Both
 * start as `null`.
 *
 * The watcher is cleared automatically when the reactive scope is
 * destroyed. Safe to call during SSR – no browser APIs are accessed
 * when `navigator` is undefined.
 *
 * @param options - Standard `PositionOptions` forwarded to `watchPosition`.
 * @returns An object with `coords` and `error` getter functions.
 *
 * @example
 * ```ts
 * const { coords, error } = useGeolocation({ enableHighAccuracy: true });
 * coords(); // GeolocationCoordinates | null
 * error();  // GeolocationPositionError | null
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

		return () => {
			navigator.geolocation.clearWatch(watchId);
		};
	});

	return {
		coords: () => coords,
		error: () => error
	};
}

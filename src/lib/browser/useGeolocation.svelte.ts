import { useSupported } from './useSupported.svelte.js';

/** Return value of {@link useGeolocation}. */
export interface UseGeolocationReturn {
	/** Getter for the latest coordinates snapshot, or `null` before the first fix. */
	coords: () => GeolocationCoordinates | null;
	/** Getter for the last geolocation error, or `null` when there is none. */
	error: () => GeolocationPositionError | null;
}

/** Reactively tracks the device geographic position using `navigator.geolocation.watchPosition`. */
export function useGeolocation(options?: PositionOptions): UseGeolocationReturn {
	const isSupported = useSupported(() => 'geolocation' in navigator);

	let coords = $state<GeolocationCoordinates | null>(null);
	let error = $state<GeolocationPositionError | null>(null);

	$effect(() => {
		if (!isSupported()) return;

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

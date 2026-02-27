/**
 * Shape of the return value from {@link useNetwork}.
 */
export interface UseNetworkReturn {
	/** Effective bandwidth estimate in Mbps. `undefined` when unsupported. */
	downlink: () => number | undefined;
	/** Effective connection type (e.g. `'4g'`, `'slow-2g'`). `undefined` when unsupported. */
	effectiveType: () => string | undefined;
	/** Round-trip time estimate in milliseconds. `undefined` when unsupported. */
	rtt: () => number | undefined;
	/** Whether the user has requested a reduced-data mode. `undefined` when unsupported. */
	saveData: () => boolean | undefined;
}

// Minimal typing for the Network Information API which is not yet in lib.dom.d.ts
interface NetworkInformation extends EventTarget {
	readonly downlink: number;
	readonly effectiveType: string;
	readonly rtt: number;
	readonly saveData: boolean;
}

/**
 * Reactive Network Information API wrapper.
 *
 * Exposes `downlink`, `effectiveType`, `rtt`, and `saveData` from
 * `navigator.connection`. All values are `undefined` when the API is
 * not available (SSR, Firefox, Safari). Updates reactively on the
 * `change` event of the connection object.
 *
 * @returns An object of getter functions for each network property.
 *
 * @example
 * ```ts
 * const { effectiveType, downlink } = useNetwork();
 * effectiveType(); // '4g' | '3g' | undefined
 * downlink();      // 10 | undefined
 * ```
 */
export function useNetwork(): UseNetworkReturn {
	const isBrowser = typeof navigator !== 'undefined';
	const connection = isBrowser
		? ((navigator as unknown as { connection?: NetworkInformation }).connection ?? null)
		: null;

	function snapshot() {
		if (!connection) return { downlink: undefined, effectiveType: undefined, rtt: undefined, saveData: undefined };
		return {
			downlink: connection.downlink,
			effectiveType: connection.effectiveType,
			rtt: connection.rtt,
			saveData: connection.saveData
		};
	}

	let state = $state(snapshot());

	$effect(() => {
		if (!connection) return;

		function handleChange() {
			state = snapshot();
		}

		connection.addEventListener('change', handleChange);
		return () => connection.removeEventListener('change', handleChange);
	});

	return {
		downlink: () => state.downlink,
		effectiveType: () => state.effectiveType,
		rtt: () => state.rtt,
		saveData: () => state.saveData
	};
}

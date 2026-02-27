/** Minimal typing for the Battery Status API. */
interface BatteryManager extends EventTarget {
	readonly charging: boolean;
	readonly level: number;
}

/** Augmented Navigator with optional getBattery. */
interface NavigatorWithBattery extends Navigator {
	getBattery?: () => Promise<BatteryManager>;
}

/**
 * Return value of {@link useBattery}.
 */
export interface UseBatteryReturn {
	/** Getter returning `true` when the battery is currently charging. */
	charging: () => boolean;
	/**
	 * Getter returning the battery charge level as a number between `0` and `1`.
	 * Returns `1` when the Battery Status API is unsupported.
	 */
	level: () => number;
}

/**
 * Reactive Battery Status API wrapper.
 *
 * Calls `navigator.getBattery()` and keeps `charging` and `level` up-to-date
 * by subscribing to the `chargingchange` and `levelchange` events on the
 * `BatteryManager` object. Both values default to `false` / `1` until the
 * promise resolves.
 *
 * Gracefully degrades when the Battery Status API is unavailable (returns
 * the default values and does not throw). Safe to call during SSR.
 *
 * @returns An object with `charging` and `level` getter functions.
 *
 * @example
 * ```ts
 * const { charging, level } = useBattery();
 * charging(); // true | false
 * level();    // 0.0 – 1.0
 * ```
 */
export function useBattery(): UseBatteryReturn {
	const isBrowser = typeof navigator !== 'undefined';

	let charging = $state<boolean>(false);
	let level = $state<number>(1);
	let battery: BatteryManager | null = null;

	function handleChargingChange(): void {
		if (battery) charging = battery.charging;
	}

	function handleLevelChange(): void {
		if (battery) level = battery.level;
	}

	$effect(() => {
		if (!isBrowser) return;

		const nav = navigator as NavigatorWithBattery;
		if (typeof nav.getBattery !== 'function') return;

		let active = true;

		nav.getBattery().then((batt) => {
			if (!active) return;
			battery = batt;
			charging = batt.charging;
			level = batt.level;

			batt.addEventListener('chargingchange', handleChargingChange);
			batt.addEventListener('levelchange', handleLevelChange);
		});

		return () => {
			active = false;
			if (battery) {
				battery.removeEventListener('chargingchange', handleChargingChange);
				battery.removeEventListener('levelchange', handleLevelChange);
				battery = null;
			}
		};
	});

	return {
		charging: () => charging,
		level: () => level
	};
}

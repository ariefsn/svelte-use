/** Minimal typing for the Battery Status API. */
interface BatteryManager extends EventTarget {
	readonly charging: boolean;
	readonly level: number;
}

/** Augmented Navigator with optional getBattery. */
interface NavigatorWithBattery extends Navigator {
	getBattery?: () => Promise<BatteryManager>;
}

/** Return value of {@link useBattery}. */
export interface UseBatteryReturn {
	/** Getter returning `true` when the battery is currently charging. */
	charging: () => boolean;
	/**
	 * Getter returning the battery charge level as a number between `0` and `1`. Returns `1` when the
	 * Battery Status API is unsupported.
	 */
	level: () => number;
}

/** Reactively tracks battery charging state and charge level via the Battery Status API. */
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

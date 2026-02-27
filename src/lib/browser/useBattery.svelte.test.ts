import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useBattery } from './useBattery.svelte.js';

interface BatteryManagerMock extends EventTarget {
	charging: boolean;
	level: number;
}

function makeBattery(overrides: Partial<BatteryManagerMock> = {}): BatteryManagerMock {
	const batt = new EventTarget() as BatteryManagerMock;
	batt.charging = overrides.charging ?? true;
	batt.level = overrides.level ?? 0.8;
	return batt;
}

describe('useBattery', () => {
	let originalGetBattery: (() => Promise<BatteryManagerMock>) | undefined;

	beforeEach(() => {
		originalGetBattery = (navigator as { getBattery?: () => Promise<BatteryManagerMock> })
			.getBattery;
	});

	afterEach(() => {
		Object.defineProperty(navigator, 'getBattery', {
			value: originalGetBattery,
			writable: true,
			configurable: true
		});
	});

	test('charging defaults to false before promise resolves', () => {
		// getBattery never resolves in this test
		Object.defineProperty(navigator, 'getBattery', {
			value: () => new Promise(() => {}),
			writable: true,
			configurable: true
		});

		const cleanup = $effect.root(() => {
			const { charging } = useBattery();
			expect(charging()).toBe(false);
		});
		cleanup();
	});

	test('level defaults to 1 before promise resolves', () => {
		Object.defineProperty(navigator, 'getBattery', {
			value: () => new Promise(() => {}),
			writable: true,
			configurable: true
		});

		const cleanup = $effect.root(() => {
			const { level } = useBattery();
			expect(level()).toBe(1);
		});
		cleanup();
	});

	test('reads initial battery values after getBattery resolves', async () => {
		const battery = makeBattery({ charging: true, level: 0.75 });
		Object.defineProperty(navigator, 'getBattery', {
			value: () => Promise.resolve(battery),
			writable: true,
			configurable: true
		});

		let chargingGetter!: () => boolean;
		let levelGetter!: () => number;

		const cleanup = $effect.root(() => {
			const { charging, level } = useBattery();
			chargingGetter = charging;
			levelGetter = level;
			flushSync();
		});

		// Allow the microtask queue to drain so getBattery resolves
		await Promise.resolve();
		flushSync();

		expect(chargingGetter()).toBe(true);
		expect(levelGetter()).toBe(0.75);

		cleanup();
	});

	test('updates charging on chargingchange event', async () => {
		const battery = makeBattery({ charging: true, level: 0.5 });
		Object.defineProperty(navigator, 'getBattery', {
			value: () => Promise.resolve(battery),
			writable: true,
			configurable: true
		});

		let chargingGetter!: () => boolean;

		const cleanup = $effect.root(() => {
			const { charging } = useBattery();
			chargingGetter = charging;
			flushSync();
		});

		await Promise.resolve();
		flushSync();

		battery.charging = false;
		battery.dispatchEvent(new Event('chargingchange'));
		flushSync();

		expect(chargingGetter()).toBe(false);
		cleanup();
	});

	test('updates level on levelchange event', async () => {
		const battery = makeBattery({ charging: false, level: 0.9 });
		Object.defineProperty(navigator, 'getBattery', {
			value: () => Promise.resolve(battery),
			writable: true,
			configurable: true
		});

		let levelGetter!: () => number;

		const cleanup = $effect.root(() => {
			const { level } = useBattery();
			levelGetter = level;
			flushSync();
		});

		await Promise.resolve();
		flushSync();

		battery.level = 0.5;
		battery.dispatchEvent(new Event('levelchange'));
		flushSync();

		expect(levelGetter()).toBe(0.5);
		cleanup();
	});

	test('handles missing getBattery gracefully', () => {
		Object.defineProperty(navigator, 'getBattery', {
			value: undefined,
			writable: true,
			configurable: true
		});

		const cleanup = $effect.root(() => {
			const { charging, level } = useBattery();
			// Should not throw and return defaults
			expect(charging()).toBe(false);
			expect(level()).toBe(1);
		});
		cleanup();
	});

	test('removes battery event listeners on cleanup', async () => {
		const battery = makeBattery({ charging: true, level: 1 });
		Object.defineProperty(navigator, 'getBattery', {
			value: () => Promise.resolve(battery),
			writable: true,
			configurable: true
		});

		const removeSpy = vi.spyOn(battery, 'removeEventListener');

		const cleanup = $effect.root(() => {
			useBattery();
			flushSync();
		});

		await Promise.resolve();
		flushSync();

		cleanup();
		flushSync();

		expect(removeSpy).toHaveBeenCalledWith('chargingchange', expect.any(Function));
		expect(removeSpy).toHaveBeenCalledWith('levelchange', expect.any(Function));

		removeSpy.mockRestore();
	});
});

import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useNetwork } from './useNetwork.svelte.js';

type NetworkInformationMock = EventTarget & {
	downlink: number;
	effectiveType: string;
	rtt: number;
	saveData: boolean;
};

function makeConnection(overrides: Partial<NetworkInformationMock> = {}): NetworkInformationMock {
	const et = new EventTarget() as NetworkInformationMock;
	et.downlink = overrides.downlink ?? 10;
	et.effectiveType = overrides.effectiveType ?? '4g';
	et.rtt = overrides.rtt ?? 50;
	et.saveData = overrides.saveData ?? false;
	return et;
}

describe('useNetwork', () => {
	let originalConnection: unknown;

	beforeEach(() => {
		originalConnection = (navigator as Record<string, unknown>)['connection'];
	});

	afterEach(() => {
		Object.defineProperty(navigator, 'connection', {
			value: originalConnection,
			writable: true,
			configurable: true
		});
	});

	test('returns undefined values when navigator.connection is not available', () => {
		Object.defineProperty(navigator, 'connection', {
			value: undefined,
			writable: true,
			configurable: true
		});

		const cleanup = $effect.root(() => {
			const { downlink, effectiveType, rtt, saveData } = useNetwork();
			expect(downlink()).toBeUndefined();
			expect(effectiveType()).toBeUndefined();
			expect(rtt()).toBeUndefined();
			expect(saveData()).toBeUndefined();
		});
		cleanup();
	});

	test('reads initial values from navigator.connection', () => {
		const conn = makeConnection({ downlink: 5, effectiveType: '3g', rtt: 100, saveData: true });
		Object.defineProperty(navigator, 'connection', {
			value: conn,
			writable: true,
			configurable: true
		});

		const cleanup = $effect.root(() => {
			const { downlink, effectiveType, rtt, saveData } = useNetwork();
			expect(downlink()).toBe(5);
			expect(effectiveType()).toBe('3g');
			expect(rtt()).toBe(100);
			expect(saveData()).toBe(true);
		});
		cleanup();
	});

	test('updates reactively when connection fires change event', () => {
		const conn = makeConnection({ downlink: 10, effectiveType: '4g', rtt: 50, saveData: false });
		Object.defineProperty(navigator, 'connection', {
			value: conn,
			writable: true,
			configurable: true
		});

		const cleanup = $effect.root(() => {
			const { downlink, effectiveType } = useNetwork();
			flushSync();

			expect(downlink()).toBe(10);
			expect(effectiveType()).toBe('4g');

			// Simulate connection change
			conn.downlink = 2;
			conn.effectiveType = '2g';
			conn.dispatchEvent(new Event('change'));
			flushSync();

			expect(downlink()).toBe(2);
			expect(effectiveType()).toBe('2g');
		});
		cleanup();
	});

	test('cleanup removes change listener', () => {
		const conn = makeConnection();
		Object.defineProperty(navigator, 'connection', {
			value: conn,
			writable: true,
			configurable: true
		});

		const addSpy = vi.spyOn(conn, 'addEventListener');
		const removeSpy = vi.spyOn(conn, 'removeEventListener');

		const cleanup = $effect.root(() => {
			useNetwork();
			flushSync();
		});

		cleanup();
		flushSync();

		expect(addSpy).toHaveBeenCalledWith('change', expect.any(Function));
		expect(removeSpy).toHaveBeenCalledWith('change', expect.any(Function));

		addSpy.mockRestore();
		removeSpy.mockRestore();
	});

	test('saveData reflects boolean correctly', () => {
		const conn = makeConnection({ saveData: true });
		Object.defineProperty(navigator, 'connection', {
			value: conn,
			writable: true,
			configurable: true
		});

		const cleanup = $effect.root(() => {
			const { saveData } = useNetwork();
			expect(saveData()).toBe(true);
		});
		cleanup();
	});
});

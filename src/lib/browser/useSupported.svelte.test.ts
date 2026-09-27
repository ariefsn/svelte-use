import { describe, expect, test, vi } from 'vitest';
import { useSupported } from './useSupported.svelte.js';

describe('useSupported', () => {
	test('returns true when the predicate passes', () => {
		expect(useSupported(() => true)()).toBe(true);
	});

	test('returns false when the predicate fails', () => {
		expect(useSupported(() => false)()).toBe(false);
	});

	test('coerces a truthy non-boolean result', () => {
		expect(useSupported(() => 'geolocation' in navigator)()).toBe(true);
	});

	test('treats a throwing predicate as unsupported', () => {
		expect(
			useSupported(() => {
				throw new Error('blocked by permissions policy');
			})()
		).toBe(false);
	});

	test('evaluates the predicate once, not on every read', () => {
		const predicate = vi.fn(() => true);
		const isSupported = useSupported(predicate);

		isSupported();
		isSupported();
		isSupported();

		expect(predicate).toHaveBeenCalledOnce();
	});

	test('works outside a reactive scope', () => {
		// No $effect.root here on purpose: useSupported registers no effect, so
		// it must not throw effect_orphan.
		expect(() => useSupported(() => true)).not.toThrow();
	});

	test('detects a real missing API', () => {
		expect(useSupported(() => 'definitelyNotARealApi' in window)()).toBe(false);
	});
});

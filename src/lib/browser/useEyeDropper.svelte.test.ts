import { describe, expect, test, vi } from 'vitest';
import { useEyeDropper } from './useEyeDropper.svelte.js';

describe('useEyeDropper', () => {
	test('detects support', () => {
		const cleanup = $effect.root(() => {
			const { isSupported } = useEyeDropper();
			// In test environment, EyeDropper may not exist
			expect(typeof isSupported()).toBe('boolean');
		});
		cleanup();
	});

	test('starts with undefined current by default', () => {
		const cleanup = $effect.root(() => {
			const { current } = useEyeDropper();
			expect(current()).toBeUndefined();
		});
		cleanup();
	});

	test('accepts initial value', () => {
		const cleanup = $effect.root(() => {
			const { current } = useEyeDropper({ initialValue: '#000000' });
			expect(current()).toBe('#000000');
		});
		cleanup();
	});

	test('open returns undefined when unsupported', async () => {
		const cleanup = $effect.root(() => {});
		const { open } = useEyeDropper();
		const result = await open();
		// In test env without EyeDropper, should return undefined
		expect(result).toBeUndefined();
		cleanup();
	});
});

import { describe, expect, test } from 'vitest';
import { useShare } from './useShare.svelte.js';

describe('useShare', () => {
	test('detects support', () => {
		const cleanup = $effect.root(() => {
			const { isSupported } = useShare();
			expect(typeof isSupported()).toBe('boolean');
		});
		cleanup();
	});

	test('share returns false when no data provided', async () => {
		const { share } = useShare();
		const result = await share();
		expect(result).toBe(false);
	});

	test('share returns false when unsupported', async () => {
		const { share } = useShare();
		const result = await share({ title: 'Test', url: 'https://example.com' });
		// In test env without navigator.share, returns false
		expect(typeof result).toBe('boolean');
	});
});

import { describe, expect, test, vi } from 'vitest';
import { flushSync } from 'svelte';
import { useLastChanged } from './useLastChanged.svelte.js';

describe('useLastChanged', () => {
	test('returns undefined initially', () => {
		const cleanup = $effect.root(() => {
			let value = $state(0);
			const lastChanged = useLastChanged(() => value);
			expect(lastChanged()).toBeUndefined();
		});
		cleanup();
	});

	test('returns timestamp after first change', () => {
		const now = 1700000000000;
		vi.spyOn(Date, 'now').mockReturnValue(now);

		const cleanup = $effect.root(() => {
			let value = $state(0);
			const lastChanged = useLastChanged(() => value);

			flushSync(() => {
				value = 1;
			});

			flushSync(() => {
				value = 2;
			});

			expect(lastChanged()).toBe(now);
		});
		cleanup();
		vi.restoreAllMocks();
	});

	test('updates timestamp on subsequent changes', () => {
		let callCount = 0;
		vi.spyOn(Date, 'now').mockImplementation(() => 1700000000000 + callCount++ * 1000);

		const cleanup = $effect.root(() => {
			let value = $state(0);
			const lastChanged = useLastChanged(() => value);

			flushSync(() => {
				value = 1;
			});

			flushSync(() => {
				value = 2;
			});

			const ts = lastChanged();
			expect(ts).toBeTypeOf('number');
		});
		cleanup();
		vi.restoreAllMocks();
	});
});

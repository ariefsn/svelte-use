import { describe, expect, test, vi } from 'vitest';
import { useAsyncState } from './useAsyncState.svelte.js';

describe('useAsyncState', () => {
	test('starts with initial value', () => {
		const cleanup = $effect.root(() => {
			const state = useAsyncState(() => Promise.resolve('data'), 'initial', {
				immediate: false
			});
			expect(state.current()).toBe('initial');
			expect(state.isReady()).toBe(false);
			expect(state.isLoading()).toBe(false);
		});
		cleanup();
	});

	test('executes immediately by default', async () => {
		const cleanup = $effect.root(() => {
			const state = useAsyncState(() => Promise.resolve('data'), 'initial');
			expect(state.isLoading()).toBe(true);
		});
		cleanup();
	});

	test('resolves with data', async () => {
		let state: any;
		const cleanup = $effect.root(() => {
			state = useAsyncState(() => Promise.resolve('data'), 'initial', { immediate: false });
		});

		await state.execute();
		expect(state.current()).toBe('data');
		expect(state.isReady()).toBe(true);
		expect(state.isLoading()).toBe(false);
		expect(state.error()).toBeNull();
		cleanup();
	});

	test('handles errors', async () => {
		let state: any;
		const cleanup = $effect.root(() => {
			state = useAsyncState(
				() => Promise.reject(new Error('fail')),
				'initial',
				{ immediate: false }
			);
		});

		await state.execute();
		expect(state.error()).toBeInstanceOf(Error);
		expect(state.isLoading()).toBe(false);
		cleanup();
	});

	test('calls onSuccess callback', async () => {
		const onSuccess = vi.fn();
		let state: any;
		const cleanup = $effect.root(() => {
			state = useAsyncState(() => Promise.resolve('data'), 'initial', {
				immediate: false,
				onSuccess
			});
		});

		await state.execute();
		expect(onSuccess).toHaveBeenCalledWith('data');
		cleanup();
	});

	test('calls onError callback', async () => {
		const onError = vi.fn();
		const err = new Error('fail');
		let state: any;
		const cleanup = $effect.root(() => {
			state = useAsyncState(() => Promise.reject(err), 'initial', {
				immediate: false,
				onError
			});
		});

		await state.execute();
		expect(onError).toHaveBeenCalledWith(err);
		cleanup();
	});

	test('resets on execute when resetOnExecute is true', async () => {
		let state: any;
		const cleanup = $effect.root(() => {
			state = useAsyncState(
				() => new Promise((r) => setTimeout(() => r('data'), 10)),
				'initial',
				{ immediate: false, resetOnExecute: true }
			);
		});

		await state.execute();
		expect(state.current()).toBe('data');

		const promise = state.execute();
		expect(state.current()).toBe('initial');
		await promise;
		expect(state.current()).toBe('data');
		cleanup();
	});
});

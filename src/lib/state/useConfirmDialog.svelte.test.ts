import { flushSync } from 'svelte';
import { describe, expect, test, vi } from 'vitest';
import { useConfirmDialog } from './useConfirmDialog.svelte.js';

describe('useConfirmDialog', () => {
	test('reveal() resolves with the confirmed value', async () => {
		let dialog!: ReturnType<typeof useConfirmDialog<string, number, string>>;
		const cleanup = $effect.root(() => {
			dialog = useConfirmDialog<string, number, string>();
		});

		expect(dialog.isRevealed()).toBe(false);

		const pending = dialog.reveal('Delete file?');
		flushSync();

		expect(dialog.isRevealed()).toBe(true);
		expect(dialog.revealData()).toBe('Delete file?');

		dialog.confirm(42);
		const outcome = await pending;

		expect(outcome.isCanceled).toBe(false);
		if (!outcome.isCanceled) expect(outcome.data).toBe(42);
		flushSync();
		expect(dialog.isRevealed()).toBe(false);

		cleanup();
	});

	test('cancel() resolves as canceled', async () => {
		let dialog!: ReturnType<typeof useConfirmDialog<void, void, string>>;
		const cleanup = $effect.root(() => {
			dialog = useConfirmDialog<void, void, string>();
		});

		const pending = dialog.reveal();
		dialog.cancel('dismissed');
		const outcome = await pending;

		expect(outcome.isCanceled).toBe(true);
		if (outcome.isCanceled) expect(outcome.data).toBe('dismissed');

		cleanup();
	});

	test('fires the lifecycle callbacks', async () => {
		const onReveal = vi.fn();
		const onConfirm = vi.fn();
		const onCancel = vi.fn();

		let dialog!: ReturnType<typeof useConfirmDialog<string, string, string>>;
		const cleanup = $effect.root(() => {
			dialog = useConfirmDialog<string, string, string>({ onReveal, onConfirm, onCancel });
		});

		const first = dialog.reveal('why');
		expect(onReveal).toHaveBeenCalledWith('why');

		dialog.confirm('yes');
		await first;
		expect(onConfirm).toHaveBeenCalledWith('yes');
		expect(onCancel).not.toHaveBeenCalled();

		const second = dialog.reveal('again');
		dialog.cancel('no');
		await second;
		expect(onCancel).toHaveBeenCalledWith('no');

		cleanup();
	});

	test('confirm() and cancel() do nothing when nothing is open', () => {
		const onConfirm = vi.fn();

		let dialog!: ReturnType<typeof useConfirmDialog>;
		const cleanup = $effect.root(() => {
			dialog = useConfirmDialog({ onConfirm });
		});

		dialog.confirm();
		expect(onConfirm).not.toHaveBeenCalled();
		expect(dialog.isRevealed()).toBe(false);

		cleanup();
	});

	test('a second reveal cancels the first rather than orphaning it', async () => {
		// Otherwise the first caller's `await` never settles.
		let dialog!: ReturnType<typeof useConfirmDialog<string>>;
		const cleanup = $effect.root(() => {
			dialog = useConfirmDialog<string>();
		});

		const first = dialog.reveal('one');
		const second = dialog.reveal('two');
		flushSync();

		await expect(first).resolves.toMatchObject({ isCanceled: true });
		expect(dialog.revealData()).toBe('two');
		expect(dialog.isRevealed()).toBe(true);

		dialog.confirm();
		await expect(second).resolves.toMatchObject({ isCanceled: false });

		cleanup();
	});

	test('unmounting while open resolves the pending promise as canceled', async () => {
		// Without this the caller's `await reveal()` hangs for the life of the
		// page — a silent deadlock rather than a visible error.
		let dialog!: ReturnType<typeof useConfirmDialog<string>>;
		const cleanup = $effect.root(() => {
			dialog = useConfirmDialog<string>();
		});
		flushSync();

		const pending = dialog.reveal('still open');
		flushSync();

		cleanup();
		flushSync();

		await expect(pending).resolves.toMatchObject({ isCanceled: true });
	});

	test('isRevealed is reactive', () => {
		const cleanup = $effect.root(() => {
			const dialog = useConfirmDialog();
			const label = $derived(dialog.isRevealed() ? 'open' : 'closed');

			expect(label).toBe('closed');
			void dialog.reveal();
			flushSync();
			expect(label).toBe('open');

			dialog.confirm();
			flushSync();
			expect(label).toBe('closed');
		});
		cleanup();
	});
});

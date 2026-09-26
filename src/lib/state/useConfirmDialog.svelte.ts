/**
 * How a reveal ended.
 *
 * A discriminated union, so `if (isCanceled)` narrows `data` to the type that
 * branch actually carries.
 */
export type ConfirmDialogOutcome<TConfirm, TCancel> =
	| { readonly isCanceled: false; readonly data: TConfirm }
	| { readonly isCanceled: true; readonly data: TCancel };

/** Options for `useConfirmDialog`. */
export interface UseConfirmDialogOptions<TReveal, TConfirm, TCancel> {
	/** Called when the dialog is revealed, with whatever `reveal()` was given. */
	onReveal?: (data: TReveal) => void;
	/** Called on confirmation. */
	onConfirm?: (data: TConfirm) => void;
	/** Called on cancellation, including an unmount while open. */
	onCancel?: (data: TCancel) => void;
}

/** Return value of `useConfirmDialog`. */
export interface UseConfirmDialogReturn<TReveal, TConfirm, TCancel> {
	/** Whether the dialog is open. Bind your markup to this. */
	isRevealed: () => boolean;
	/** The value passed to `reveal()`, for rendering the prompt. */
	revealData: () => TReveal | null;
	/** Opens the dialog and resolves once it is confirmed or cancelled. */
	reveal: (data?: TReveal) => Promise<ConfirmDialogOutcome<TConfirm, TCancel>>;
	/** Confirms, resolving the pending `reveal()`. */
	confirm: (data?: TConfirm) => void;
	/** Cancels, resolving the pending `reveal()`. */
	cancel: (data?: TCancel) => void;
}

/**
 * Turns a confirmation dialog into a single `await`.
 *
 * Logic only — you still write the markup. What it removes is the awkward
 * shape of imperative confirmation: instead of setting a flag, passing
 * callbacks down, and resuming work in one of them, the whole flow reads
 * top-to-bottom:
 *
 * ```ts
 * const { isCanceled } = await reveal();
 * if (isCanceled) return;
 * await deleteAccount();
 * ```
 *
 * Two cases that quietly hang a naive implementation are handled: unmounting
 * while the dialog is open resolves the promise as cancelled rather than
 * leaving the caller's `await` pending forever, and a second `reveal()` while
 * one is open cancels the first rather than orphaning it.
 *
 * Pure state with no DOM, so it renders on the server.
 *
 * @template TReveal - What `reveal()` carries, for rendering the prompt
 * @template TConfirm - What `confirm()` returns
 * @template TCancel - What `cancel()` returns
 * @param options - Lifecycle callbacks
 * @returns Dialog state plus `reveal`, `confirm` and `cancel`
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useConfirmDialog } from '@ariefsn/svelte-use';
 *
 *   const dialog = useConfirmDialog<string>();
 *
 *   async function remove(name: string) {
 *     const { isCanceled } = await dialog.reveal(name);
 *     if (isCanceled) return;
 *     await deleteItem(name);
 *   }
 * </script>
 *
 * {#if dialog.isRevealed()}
 *   <p>Delete {dialog.revealData()}?</p>
 *   <button onclick={() => dialog.confirm()}>Delete</button>
 *   <button onclick={() => dialog.cancel()}>Keep</button>
 * {/if}
 * ```
 */
export function useConfirmDialog<TReveal = void, TConfirm = void, TCancel = void>(
	options: UseConfirmDialogOptions<TReveal, TConfirm, TCancel> = {}
): UseConfirmDialogReturn<TReveal, TConfirm, TCancel> {
	const { onReveal, onConfirm, onCancel } = options;

	let isRevealed = $state(false);
	let revealData = $state<TReveal | null>(null);

	// Plain `let`: the pending resolver is plumbing, never reactive.
	let settle: ((outcome: ConfirmDialogOutcome<TConfirm, TCancel>) => void) | null = null;

	function finish(outcome: ConfirmDialogOutcome<TConfirm, TCancel>): void {
		const resolve = settle;
		settle = null;
		isRevealed = false;
		resolve?.(outcome);
	}

	function confirm(data?: TConfirm): void {
		if (!settle) return;
		const value = data as TConfirm;
		finish({ isCanceled: false, data: value });
		onConfirm?.(value);
	}

	function cancel(data?: TCancel): void {
		if (!settle) return;
		const value = data as TCancel;
		finish({ isCanceled: true, data: value });
		onCancel?.(value);
	}

	function reveal(data?: TReveal): Promise<ConfirmDialogOutcome<TConfirm, TCancel>> {
		// A second reveal while one is open would orphan the first caller's
		// promise, so the earlier one is resolved as cancelled.
		if (settle) cancel();

		const value = data as TReveal;
		revealData = value;
		isRevealed = true;
		onReveal?.(value);

		return new Promise<ConfirmDialogOutcome<TConfirm, TCancel>>((resolve) => {
			settle = resolve;
		});
	}

	// Dependency-free teardown. Without it, unmounting while the dialog is open
	// leaves the caller's `await reveal()` pending for the life of the page.
	$effect(() => () => {
		if (settle) cancel();
	});

	return {
		isRevealed: () => isRevealed,
		revealData: () => revealData,
		reveal,
		confirm,
		cancel
	};
}

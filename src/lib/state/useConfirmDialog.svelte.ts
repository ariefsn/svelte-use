/** How a reveal ended. */
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
 * Turns a confirmation dialog into a single `await`. Logic only — you still write the markup; what
 * it removes is the awkward shape of flags and callbacks.
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

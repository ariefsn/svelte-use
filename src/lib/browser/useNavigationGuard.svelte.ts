import { beforeNavigate, goto } from '$app/navigation';

export interface UseNavigationGuardOptions {
	/** Function that returns whether navigation should be blocked */
	shouldBlock: () => boolean;
	/** Callback when navigation is blocked */
	onBlock?: () => void;
}

export interface UseNavigationGuardReturn {
	/** Confirm the pending navigation */
	confirm: () => void;
	/** Cancel the pending navigation */
	cancel: () => void;
}

/**
 * Guards SvelteKit navigation with a confirm/cancel flow.
 *
 * When `shouldBlock` returns `true`, navigation is cancelled and the pending
 * URL is stored. Call `confirm()` to proceed or `cancel()` to stay.
 *
 * @param options - Guard options with `shouldBlock` check and optional `onBlock` callback
 * @returns Object with `confirm` and `cancel` functions
 *
 * @example
 * ```ts
 * let hasChanges = $state(false);
 * const { confirm, cancel } = useNavigationGuard({
 *   shouldBlock: () => hasChanges,
 *   onBlock: () => showDialog = true
 * });
 * // User tries to navigate away → onBlock fires
 * // confirm() → navigates to pending URL
 * // cancel() → stays on current page
 * ```
 */
export function useNavigationGuard(
	options: UseNavigationGuardOptions
): UseNavigationGuardReturn {
	let pendingUrl: string | null = null;

	beforeNavigate((nav) => {
		if (!options.shouldBlock()) return;

		if (nav.type === 'popstate' || nav.type === 'link' || nav.type === 'goto') {
			nav.cancel();
			pendingUrl = nav.to?.url.toString() ?? null;
			options.onBlock?.();
		}
	});

	function confirm() {
		if (!pendingUrl) return;
		const url = pendingUrl;
		pendingUrl = null;
		goto(url);
	}

	function cancel() {
		pendingUrl = null;
	}

	return {
		confirm,
		cancel
	};
}

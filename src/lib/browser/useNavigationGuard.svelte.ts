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

/** Guards SvelteKit navigation with a confirm/cancel flow for unsaved changes. */
export function useNavigationGuard(options: UseNavigationGuardOptions): UseNavigationGuardReturn {
	let pendingUrl: string | null = null;

	// Set by confirm() so the guard lets exactly one navigation through.
	let bypassOnce = false;

	beforeNavigate((nav) => {
		if (bypassOnce) {
			bypassOnce = false;
			return;
		}

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
		bypassOnce = true;
		// eslint-disable-next-line svelte/no-navigation-without-resolve -- `url` is the pending navigation target captured from beforeNavigate, already a resolved href
		goto(url).finally(() => {
			// Safety net for the case where the handler never ran (navigation
			// rejected upstream), so a stale flag can't leak into a later one.
			bypassOnce = false;
		});
	}

	function cancel() {
		pendingUrl = null;
	}

	return {
		confirm,
		cancel
	};
}

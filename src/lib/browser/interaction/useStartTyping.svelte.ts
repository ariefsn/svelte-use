/**
 * Detects when a user starts typing on non-editable elements.
 *
 * Fires the callback when a printable key is pressed while the active element
 * is not an input, textarea, or contentEditable element.
 *
 * @param callback - Function to call with the KeyboardEvent when typing starts
 * @returns A cleanup function
 *
 * @example
 * ```ts
 * useStartTyping((e) => {
 *   // Focus a search input when user starts typing
 *   searchInput.focus();
 * });
 * ```
 */
export function useStartTyping(callback: (e: KeyboardEvent) => void): () => void {
	const isBrowser = typeof document !== 'undefined';

	function isEditable(el: Element | null): boolean {
		if (!el) return false;
		const tag = el.tagName;
		if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
		if ((el as HTMLElement).isContentEditable) return true;
		return false;
	}

	function handler(e: KeyboardEvent) {
		if (isEditable(document.activeElement)) return;
		if (e.key.length !== 1) return;
		if (e.ctrlKey || e.metaKey || e.altKey) return;
		callback(e);
	}

	function cleanup() {
		if (isBrowser) {
			document.removeEventListener('keydown', handler);
		}
	}

	$effect(() => {
		if (!isBrowser) return;

		document.addEventListener('keydown', handler);

		return () => {
			document.removeEventListener('keydown', handler);
		};
	});

	return cleanup;
}

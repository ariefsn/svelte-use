/** Detects when a user starts typing on non-editable elements. */
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

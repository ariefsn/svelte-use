/**
 * Locks and unlocks scroll on a target element (defaults to `document.body`) by toggling `overflow:
 * hidden`. The previous overflow value is captured before locking and restored on unlock.
 */
export function useScrollLock(target?: () => HTMLElement | null | undefined): {
	isLocked: () => boolean;
	lock: () => void;
	unlock: () => void;
} {
	let _locked = $state(false);
	/** Plain (non-reactive) reference used in effect cleanup to avoid signal tracking issues. */
	let lockedRef = false;
	let previousOverflow: string | undefined;

	function resolveTarget(): HTMLElement | null {
		if (typeof document === 'undefined') return null;
		if (target) return target() ?? document.body;
		return document.body;
	}

	function lock() {
		const el = resolveTarget();
		if (!el || lockedRef) return;

		previousOverflow = el.style.overflow;
		el.style.overflow = 'hidden';
		lockedRef = true;
		_locked = true;
	}

	function _unlock(el: HTMLElement) {
		el.style.overflow = previousOverflow ?? '';
		previousOverflow = undefined;
		lockedRef = false;
		_locked = false;
	}

	function unlock() {
		const el = resolveTarget();
		if (!el || !lockedRef) return;
		_unlock(el);
	}

	$effect(() => {
		const el = resolveTarget();
		return () => {
			if (lockedRef && el) {
				_unlock(el);
			}
		};
	});

	return {
		isLocked: () => _locked,
		lock,
		unlock
	};
}

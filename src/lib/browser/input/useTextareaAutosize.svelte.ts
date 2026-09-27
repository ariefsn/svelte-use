/** Options for `useTextareaAutosize`. */
export interface UseTextareaAutosizeOptions {
	/**
	 * Reactive getter for the textarea's current value. Needed because a programmatic value change
	 * fires no `input` event.
	 */
	value?: () => string;
	/** Smallest height in rows. Below this the textarea keeps its natural height. */
	minRows?: number;
	/** Largest height in rows. Past this the textarea scrolls instead. */
	maxRows?: number;
	/** Which CSS property to drive. Default `'height'`. */
	styleProp?: 'height' | 'minHeight';
}

/** Return value of `useTextareaAutosize`. */
export interface UseTextareaAutosizeReturn {
	/** Recalculates the height immediately. */
	resize: () => void;
	/** The height last applied, in pixels. `0` before the first measurement. */
	height: () => number;
}

/** Grows a textarea to fit its content. */
export function useTextareaAutosize(
	target: () => HTMLTextAreaElement | null | undefined,
	options: UseTextareaAutosizeOptions = {}
): UseTextareaAutosizeReturn {
	const { value, minRows, maxRows, styleProp = 'height' } = options;

	let height = $state(0);

	/** Line height in pixels, for converting the row limits. */
	function lineHeight(el: HTMLTextAreaElement): number {
		const styles = window.getComputedStyle(el);
		const parsed = Number.parseFloat(styles.lineHeight);
		if (Number.isFinite(parsed)) return parsed;
		// `line-height: normal` computes to the literal string, so approximate
		// from the font size the way browsers do.
		return Number.parseFloat(styles.fontSize) * 1.2;
	}

	function resize() {
		const el = target();
		if (!el || typeof window === 'undefined') return;

		const styles = window.getComputedStyle(el);
		const border =
			Number.parseFloat(styles.borderTopWidth) + Number.parseFloat(styles.borderBottomWidth);
		const isBorderBox = styles.boxSizing === 'border-box';

		// scrollHeight never reports less than the current height, so the
		// element has to be collapsed before it can shrink.
		const previous = el.style[styleProp];
		el.style[styleProp] = '0px';
		let next = el.scrollHeight;
		el.style[styleProp] = previous;

		if (minRows !== undefined || maxRows !== undefined) {
			const line = lineHeight(el);
			const padding =
				Number.parseFloat(styles.paddingTop) + Number.parseFloat(styles.paddingBottom);
			if (minRows !== undefined) next = Math.max(next, minRows * line + padding);
			if (maxRows !== undefined) next = Math.min(next, maxRows * line + padding);
		}

		if (isBorderBox) next += border;

		el.style[styleProp] = `${next}px`;
		// Only show a scrollbar once maxRows has actually clipped the content.
		el.style.overflowY = maxRows !== undefined && el.scrollHeight > next ? 'auto' : 'hidden';
		height = next;
	}

	$effect(() => {
		const el = target();
		// Tracked deliberately: a programmatic value change fires no `input`
		// event, so re-running on it is the only way to stay in sync.
		value?.();

		if (!el || typeof window === 'undefined') return;

		resize();

		el.addEventListener('input', resize);
		// Wrapping depends on width, so a narrower window means more lines.
		window.addEventListener('resize', resize, { passive: true });

		return () => {
			el.removeEventListener('input', resize);
			window.removeEventListener('resize', resize);
		};
	});

	return {
		resize,
		height: () => height
	};
}

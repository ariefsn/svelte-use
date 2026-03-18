export interface UseTextSelectionReturn {
	/** The selected text content */
	text: () => string;
	/** Bounding rectangles of the selection */
	rects: () => DOMRect[];
	/** The Range objects of the selection */
	ranges: () => Range[];
	/** The current Selection object, or null */
	selection: () => Selection | null;
}

/**
 * Reactively tracks the current text selection in the document.
 *
 * @returns Object with `text`, `rects`, `ranges`, and `selection` getters
 *
 * @example
 * ```ts
 * const { text, rects } = useTextSelection();
 * // text() → 'selected text'
 * // rects() → [DOMRect, ...]
 * ```
 */
export function useTextSelection(): UseTextSelectionReturn {
	const isBrowser = typeof window !== 'undefined';

	let text = $state('');
	let rects = $state<DOMRect[]>([]);
	let ranges = $state<Range[]>([]);
	let selection = $state<Selection | null>(null);

	function update() {
		const sel = window.getSelection();
		selection = sel;

		if (!sel || sel.rangeCount === 0) {
			text = '';
			rects = [];
			ranges = [];
			return;
		}

		text = sel.toString();
		const r: Range[] = [];
		const d: DOMRect[] = [];
		for (let i = 0; i < sel.rangeCount; i++) {
			const range = sel.getRangeAt(i);
			r.push(range);
			d.push(range.getBoundingClientRect());
		}
		ranges = r;
		rects = d;
	}

	$effect(() => {
		if (!isBrowser) return;

		document.addEventListener('selectionchange', update);

		return () => {
			document.removeEventListener('selectionchange', update);
		};
	});

	return {
		text: () => text,
		rects: () => rects,
		ranges: () => ranges,
		selection: () => selection
	};
}

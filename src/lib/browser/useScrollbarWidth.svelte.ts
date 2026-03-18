export interface UseScrollbarWidthReturn {
	/** Horizontal scrollbar width in pixels */
	x: () => number;
	/** Vertical scrollbar width in pixels */
	y: () => number;
}

/**
 * Measures the scrollbar width of an element.
 *
 * @param target - A getter returning the target element, or null
 * @returns Object with `x` (horizontal) and `y` (vertical) scrollbar widths
 *
 * @example
 * ```ts
 * let el: HTMLElement;
 * const { x, y } = useScrollbarWidth(() => el);
 * // y() → 15 (typical scrollbar width in pixels)
 * ```
 */
export function useScrollbarWidth(
	target: () => HTMLElement | null | undefined
): UseScrollbarWidthReturn {
	let x = $state(0);
	let y = $state(0);

	$effect(() => {
		const el = target();
		if (!el) return;

		function measure() {
			const element = target();
			if (!element) return;
			x = element.offsetHeight - element.clientHeight;
			y = element.offsetWidth - element.clientWidth;
		}

		measure();

		const observer = new ResizeObserver(measure);
		observer.observe(el);

		return () => observer.disconnect();
	});

	return {
		x: () => x,
		y: () => y
	};
}

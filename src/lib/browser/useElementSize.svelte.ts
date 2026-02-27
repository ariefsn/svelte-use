/** Options for `useElementSize`. */
export interface UseElementSizeOptions {
	/**
	 * Which CSS box model to measure.
	 * @default 'content-box'
	 */
	box?: 'content-box' | 'border-box';
}

/** Return value of `useElementSize`. */
export interface UseElementSizeReturn {
	/** Reactive getter for the observed element's width in pixels. */
	width: () => number;
	/** Reactive getter for the observed element's height in pixels. */
	height: () => number;
}

/**
 * Reactive element size tracker backed by `ResizeObserver`.
 *
 * Observes the dimensions of the element returned by `target` and exposes
 * reactive `width` and `height` getters. The observer is created inside a
 * `$effect` and automatically disconnected when the reactive scope is
 * destroyed or the target changes.
 *
 * SSR safe — `ResizeObserver` is only accessed in the browser.
 *
 * @param target - Reactive getter returning the element to observe, or `null`
 * @param options - Optional configuration
 * @returns Object with reactive getters `width` and `height`
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useElementSize } from 'svelte-use';
 *
 *   let el = $state<HTMLDivElement | null>(null);
 *   const { width, height } = useElementSize(() => el);
 * </script>
 *
 * <div bind:this={el}>
 *   {width()} × {height()}
 * </div>
 * ```
 */
export function useElementSize(
	target: () => HTMLElement | null,
	options: UseElementSizeOptions = {}
): UseElementSizeReturn {
	const box = options.box ?? 'content-box';

	let width = $state(0);
	let height = $state(0);

	$effect(() => {
		if (typeof ResizeObserver === 'undefined') return;

		const el = target();
		if (!el) {
			width = 0;
			height = 0;
			return;
		}

		const observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
			const entry = entries[0];
			if (!entry) return;

			if (box === 'border-box') {
				const sizes = entry.borderBoxSize;
				if (sizes && sizes.length > 0) {
					width = sizes[0].inlineSize;
					height = sizes[0].blockSize;
				} else {
					// Fallback for older implementations
					width = entry.contentRect.width;
					height = entry.contentRect.height;
				}
			} else {
				const sizes = entry.contentBoxSize;
				if (sizes && sizes.length > 0) {
					width = sizes[0].inlineSize;
					height = sizes[0].blockSize;
				} else {
					// Fallback for older implementations
					width = entry.contentRect.width;
					height = entry.contentRect.height;
				}
			}
		});

		observer.observe(el, { box });

		return () => {
			observer.disconnect();
		};
	});

	return {
		width: () => width,
		height: () => height
	};
}

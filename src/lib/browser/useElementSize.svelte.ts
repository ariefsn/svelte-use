/** Options for `useElementSize`. */
export interface UseElementSizeOptions {
	/** Which CSS box model to measure. Default `'content-box'`. */
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
 * Reactively tracks the dimensions of a DOM element using `ResizeObserver`. Updates whenever the
 * element is resized.
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

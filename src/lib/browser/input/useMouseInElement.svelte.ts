/** Options for `useMouseInElement`. */
export interface UseMouseInElementOptions {
	/** Treat the pointer as outside when it leaves the window entirely. Default `true`. */
	handleOutside?: boolean;
	/** Also track `touchmove`, reporting the first touch point. Default `true`. */
	touch?: boolean;
}

/** Return value of `useMouseInElement`. */
export interface UseMouseInElementReturn {
	/** Pointer x relative to the viewport. */
	x: () => number;
	/** Pointer y relative to the viewport. */
	y: () => number;
	/** Pointer x relative to the element's left edge. */
	elementX: () => number;
	/** Pointer y relative to the element's top edge. */
	elementY: () => number;
	/** The element's distance from the left of the viewport. */
	elementPositionX: () => number;
	/** The element's distance from the top of the viewport. */
	elementPositionY: () => number;
	/** The element's width. */
	elementWidth: () => number;
	/** The element's height. */
	elementHeight: () => number;
	/** Whether the pointer is outside the element's bounds. */
	isOutside: () => boolean;
}

/** Reactive pointer position relative to an element. */
export function useMouseInElement(
	target: () => Element | null | undefined,
	options: UseMouseInElementOptions = {}
): UseMouseInElementReturn {
	const { handleOutside = true, touch = true } = options;

	let x = $state(0);
	let y = $state(0);
	let elementX = $state(0);
	let elementY = $state(0);
	let elementPositionX = $state(0);
	let elementPositionY = $state(0);
	let elementWidth = $state(0);
	let elementHeight = $state(0);
	let isOutside = $state(true);

	function measure(pageX: number, pageY: number) {
		const element = target();
		if (!element) return;

		const rect = element.getBoundingClientRect();

		elementPositionX = rect.left;
		elementPositionY = rect.top;
		elementWidth = rect.width;
		elementHeight = rect.height;

		x = pageX;
		y = pageY;
		elementX = pageX - rect.left;
		elementY = pageY - rect.top;

		isOutside = elementX < 0 || elementY < 0 || elementX > rect.width || elementY > rect.height;
	}

	$effect(() => {
		const element = target();
		if (typeof window === 'undefined' || !element) return;

		function onMouseMove(event: MouseEvent) {
			measure(event.clientX, event.clientY);
		}

		function onTouchMove(event: TouchEvent) {
			const point = event.touches[0];
			if (point) measure(point.clientX, point.clientY);
		}

		function onLeave() {
			isOutside = true;
		}

		window.addEventListener('mousemove', onMouseMove, { passive: true });
		if (touch) window.addEventListener('touchmove', onTouchMove, { passive: true });
		if (handleOutside) document.addEventListener('mouseleave', onLeave, { passive: true });

		return () => {
			window.removeEventListener('mousemove', onMouseMove);
			if (touch) window.removeEventListener('touchmove', onTouchMove);
			if (handleOutside) document.removeEventListener('mouseleave', onLeave);
		};
	});

	return {
		x: () => x,
		y: () => y,
		elementX: () => elementX,
		elementY: () => elementY,
		elementPositionX: () => elementPositionX,
		elementPositionY: () => elementPositionY,
		elementWidth: () => elementWidth,
		elementHeight: () => elementHeight,
		isOutside: () => isOutside
	};
}

export type SwipeDirection = 'up' | 'down' | 'left' | 'right' | 'none';

export interface UseSwipeOptions {
	/** Minimum distance in pixels to register a swipe (default: `50`) */
	threshold?: number;
	/** Whether events are passive (default: `true`) */
	passive?: boolean;
	/** Callback when touch starts */
	onStart?: (e: TouchEvent) => void;
	/** Callback during touch move */
	onMove?: (e: TouchEvent) => void;
	/** Callback when touch ends */
	onEnd?: (e: TouchEvent, direction: SwipeDirection) => void;
}

export interface UseSwipeReturn {
	/** Whether a swipe is currently in progress */
	isSwiping: () => boolean;
	/** The detected swipe direction */
	direction: () => SwipeDirection;
	/** Start position */
	coordsStart: () => { x: number; y: number };
	/** End position */
	coordsEnd: () => { x: number; y: number };
	/** Horizontal distance traveled */
	lengthX: () => number;
	/** Vertical distance traveled */
	lengthY: () => number;
	/** Reset swipe state */
	reset: () => void;
}

/**
 * Detects touch swipe gestures on an element.
 *
 * @param target - A getter returning the target element
 * @param options - Configuration for threshold, callbacks
 * @returns Object with `isSwiping`, `direction`, `coordsStart`, `coordsEnd`, `lengthX`, `lengthY`, `reset`
 *
 * @example
 * ```ts
 * let el: HTMLElement;
 * const { direction, isSwiping } = useSwipe(() => el, {
 *   onEnd: (e, dir) => console.log('swiped', dir)
 * });
 * ```
 */
export function useSwipe(
	target: () => HTMLElement | null | undefined,
	options: UseSwipeOptions = {}
): UseSwipeReturn {
	const { threshold = 50, passive = true, onStart, onMove, onEnd } = options;

	let isSwiping = $state(false);
	let direction = $state<SwipeDirection>('none');
	let startX = $state(0);
	let startY = $state(0);
	let endX = $state(0);
	let endY = $state(0);

	function reset() {
		isSwiping = false;
		direction = 'none';
		startX = 0;
		startY = 0;
		endX = 0;
		endY = 0;
	}

	function getDirection(dx: number, dy: number): SwipeDirection {
		if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return 'none';
		if (Math.abs(dx) > Math.abs(dy)) {
			return dx > 0 ? 'right' : 'left';
		}
		return dy > 0 ? 'down' : 'up';
	}

	$effect(() => {
		const el = target();
		if (!el) return;

		function handleStart(e: TouchEvent) {
			const touch = e.touches[0];
			startX = touch.clientX;
			startY = touch.clientY;
			endX = touch.clientX;
			endY = touch.clientY;
			isSwiping = true;
			direction = 'none';
			onStart?.(e);
		}

		function handleMove(e: TouchEvent) {
			if (!isSwiping) return;
			const touch = e.touches[0];
			endX = touch.clientX;
			endY = touch.clientY;
			direction = getDirection(endX - startX, endY - startY);
			onMove?.(e);
		}

		function handleEnd(e: TouchEvent) {
			if (!isSwiping) return;
			const dir = getDirection(endX - startX, endY - startY);
			direction = dir;
			isSwiping = false;
			onEnd?.(e, dir);
		}

		const listenerOptions = { passive };
		el.addEventListener('touchstart', handleStart, listenerOptions);
		el.addEventListener('touchmove', handleMove, listenerOptions);
		el.addEventListener('touchend', handleEnd, listenerOptions);
		el.addEventListener('touchcancel', handleEnd, listenerOptions);

		return () => {
			el.removeEventListener('touchstart', handleStart);
			el.removeEventListener('touchmove', handleMove);
			el.removeEventListener('touchend', handleEnd);
			el.removeEventListener('touchcancel', handleEnd);
		};
	});

	return {
		isSwiping: () => isSwiping,
		direction: () => direction,
		coordsStart: () => ({ x: startX, y: startY }),
		coordsEnd: () => ({ x: endX, y: endY }),
		lengthX: () => endX - startX,
		lengthY: () => endY - startY,
		reset
	};
}

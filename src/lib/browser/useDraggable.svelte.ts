/** Axis constraint for dragging. */
export type DraggableAxis = 'both' | 'x' | 'y';

/** Pointer type filter for dragging. */
export type DraggablePointerType = 'mouse' | 'touch' | 'pen';

/** 2-D coordinate pair. */
export interface DraggablePosition {
	x: number;
	y: number;
}

/** Bounding rectangle used for container-clamp logic. */
export interface DraggableBounds {
	/** Minimum x value (left edge). */
	minX?: number;
	/** Maximum x value (right edge). */
	maxX?: number;
	/** Minimum y value (top edge). */
	minY?: number;
	/** Maximum y value (bottom edge). */
	maxY?: number;
}

/**
 * Lifecycle callbacks fired during a drag interaction.
 * All callbacks receive the current pointer position and the originating
 * `PointerEvent`.
 */
export interface DraggableCallbacks {
	/**
	 * Called when a drag gesture starts (on `pointerdown` on the handle).
	 * Return `false` to cancel the drag before it begins.
	 */
	onStart?: (position: DraggablePosition, event: PointerEvent) => void | false;
	/** Called on every `pointermove` while dragging. */
	onMove?: (position: DraggablePosition, event: PointerEvent) => void;
	/** Called when the drag gesture ends (on `pointerup` / `pointercancel`). */
	onEnd?: (position: DraggablePosition, event: PointerEvent) => void;
}

/** Options for `useDraggable`. */
export interface UseDraggableOptions {
	/**
	 * Starting position of the draggable element.
	 * @default { x: 0, y: 0 }
	 */
	initialValue?: DraggablePosition;

	/**
	 * Axis along which dragging is allowed.
	 * @default 'both'
	 */
	axis?: DraggableAxis;

	/**
	 * When `true`, position tracks the pointer coordinate directly instead of
	 * computing a delta from the grab point.
	 * @default false
	 */
	exact?: boolean;

	/**
	 * Call `event.preventDefault()` on pointer events during drag.
	 * @default false
	 */
	preventDefault?: boolean;

	/**
	 * Call `event.stopPropagation()` on pointer events during drag.
	 * @default false
	 */
	stopPropagation?: boolean;

	/**
	 * Use the capture phase for pointer event listeners.
	 * @default false
	 */
	capture?: boolean;

	/**
	 * When `true`, dragging is disabled entirely.
	 * @default false
	 */
	disabled?: boolean;

	/**
	 * Restrict which mouse button initiates a drag.
	 * Maps to `PointerEvent.button`: `0` = primary, `1` = middle, `2` = secondary.
	 * `undefined` allows any button.
	 * @default 0
	 */
	button?: number;

	/**
	 * Restrict dragging to specific pointer types.
	 * `undefined` / empty allows all pointer types.
	 */
	pointerTypes?: DraggablePointerType[];

	/**
	 * Optional drag handle — the element that receives the initial
	 * `pointerdown`. Defaults to `target` when not provided.
	 * Accepts a reactive getter so it can be swapped at runtime.
	 */
	handle?: HTMLElement | (() => HTMLElement | null | undefined) | null;

	/**
	 * Container bounds for clamping the position.
	 * Accepts a static `DraggableBounds` object, an `HTMLElement` whose
	 * bounding client rect is used as the clamp region, or a getter that
	 * returns either.
	 */
	containerBounds?:
		| DraggableBounds
		| HTMLElement
		| (() => HTMLElement | DraggableBounds | null | undefined)
		| null;

	/**
	 * An alternative element that is visually moved during dragging.
	 * Does not affect position state; `style()` will still reflect the
	 * computed `x`/`y`. Accepts a getter for reactivity.
	 */
	draggingElement?: HTMLElement | (() => HTMLElement | null | undefined) | null;

	/** Lifecycle callbacks. */
	onStart?: DraggableCallbacks['onStart'];
	/** @see DraggableCallbacks.onMove */
	onMove?: DraggableCallbacks['onMove'];
	/** @see DraggableCallbacks.onEnd */
	onEnd?: DraggableCallbacks['onEnd'];
}

/** Return value of `useDraggable`. */
export interface UseDraggableReturn {
	/** Reactive getter for the current x position (pixels). */
	x: () => number;
	/** Reactive getter for the current y position (pixels). */
	y: () => number;
	/** Reactive getter; `true` while a drag gesture is in progress. */
	isDragging: () => boolean;
	/**
	 * Reactive getter that returns a CSS `transform` string suitable for use
	 * as an inline style value.
	 *
	 * @example `"transform: translate(120px, 80px);"`
	 */
	style: () => string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveElement(
	ref: HTMLElement | (() => HTMLElement | null | undefined) | null | undefined
): HTMLElement | null {
	if (!ref) return null;
	if (typeof ref === 'function') return ref() ?? null;
	return ref;
}

function resolveBounds(
	bounds:
		| DraggableBounds
		| HTMLElement
		| (() => HTMLElement | DraggableBounds | null | undefined)
		| null
		| undefined,
	draggableEl?: HTMLElement | null
): DraggableBounds | null {
	if (!bounds) return null;

	const resolved = typeof bounds === 'function' ? bounds() : bounds;
	if (!resolved) return null;

	if (resolved instanceof HTMLElement) {
		// The drag position (x, y) lives in the same local offset-space as the
		// element's CSS transform, NOT in viewport/client space.  Using
		// getBoundingClientRect() here would yield viewport-absolute numbers that
		// would be wildly off.  Instead we compute bounds from the container's
		// own dimensions so that x ∈ [0, containerWidth - elWidth] and
		// y ∈ [0, containerHeight - elHeight].
		const elWidth = draggableEl ? draggableEl.offsetWidth : 0;
		const elHeight = draggableEl ? draggableEl.offsetHeight : 0;
		return {
			minX: 0,
			maxX: Math.max(0, resolved.offsetWidth - elWidth),
			minY: 0,
			maxY: Math.max(0, resolved.offsetHeight - elHeight)
		};
	}

	return resolved as DraggableBounds;
}

function clamp(value: number, min: number | undefined, max: number | undefined): number {
	if (min !== undefined && value < min) return min;
	if (max !== undefined && value > max) return max;
	return value;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

/**
 * Full-featured reactive drag utility built on the Pointer Events API.
 *
 * Tracks an element's drag position and exposes it via reactive getter
 * functions backed by Svelte 5 `$state` runes. All DOM interaction is
 * handled inside `$effect`, ensuring proper cleanup when the reactive scope
 * is destroyed.
 *
 * Features:
 * - Axis constraint (`'both'`, `'x'`, `'y'`)
 * - Exact mode — position tracks pointer directly instead of using a delta
 * - `preventDefault` / `stopPropagation` control
 * - Capture-phase listeners
 * - Disabled flag
 * - Button filter (primary, middle, secondary)
 * - Pointer-type filter (`'mouse'`, `'touch'`, `'pen'`)
 * - Separate handle element
 * - Container bounds clamping (static object or `HTMLElement`)
 * - Custom dragging element
 * - Lifecycle callbacks (`onStart`, `onMove`, `onEnd`)
 *
 * SSR safe — no DOM APIs are called outside the browser.
 *
 * @param target - The element to make draggable (or a reactive getter for it)
 * @param options - Optional configuration
 * @returns Reactive getters `x`, `y`, `isDragging`, and `style`
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useDraggable } from '$lib/browser/useDraggable.svelte.js';
 *
 *   let el = $state<HTMLDivElement | null>(null);
 *   const drag = useDraggable(() => el, { axis: 'x' });
 * </script>
 *
 * <div bind:this={el} style={drag.style()}>Drag me</div>
 * ```
 */
export function useDraggable(
	target: HTMLElement | (() => HTMLElement | null | undefined) | null,
	options: UseDraggableOptions = {}
): UseDraggableReturn {
	const {
		initialValue = { x: 0, y: 0 },
		axis = 'both',
		exact = false,
		preventDefault = false,
		stopPropagation = false,
		capture = false,
		disabled = false,
		button = 0,
		pointerTypes,
		handle,
		containerBounds,
		draggingElement,
		onStart,
		onMove,
		onEnd
	} = options;

	let x = $state(initialValue.x);
	let y = $state(initialValue.y);
	let isDragging = $state(false);

	// Offset from pointer to element origin at drag start (delta mode).
	let offsetX = 0;
	let offsetY = 0;

	const style = $derived(`transform: translate(${x}px, ${y}px);`);

	// ------------------------------------------------------------------
	// Event handlers (defined outside $effect so they are stable refs)
	// ------------------------------------------------------------------

	function applyEventOptions(event: PointerEvent): void {
		if (preventDefault) event.preventDefault();
		if (stopPropagation) event.stopPropagation();
	}

	function resolveCurrentBounds(): DraggableBounds | null {
		const movingEl = resolveElement(draggingElement) ?? resolveElement(target);
		return resolveBounds(containerBounds, movingEl);
	}

	function clampPosition(px: number, py: number): DraggablePosition {
		const bounds = resolveCurrentBounds();
		if (!bounds) return { x: px, y: py };
		return {
			x: clamp(px, bounds.minX, bounds.maxX),
			y: clamp(py, bounds.minY, bounds.maxY)
		};
	}

	function onPointerDown(event: PointerEvent): void {
		if (disabled) return;
		if (event.button !== button) return;
		if (pointerTypes && pointerTypes.length > 0) {
			if (!pointerTypes.includes(event.pointerType as DraggablePointerType)) return;
		}

		applyEventOptions(event);

		if (!exact) {
			offsetX = event.clientX - x;
			offsetY = event.clientY - y;
		}

		const startPos: DraggablePosition = { x, y };
		const result = onStart?.(startPos, event);
		if (result === false) return;

		isDragging = true;

		// Use the draggingElement if provided, otherwise the target itself.
		const movingEl = resolveElement(draggingElement) ?? resolveElement(target);
		if (movingEl) {
			movingEl.setPointerCapture(event.pointerId);
		}
	}

	function onPointerMove(event: PointerEvent): void {
		if (!isDragging) return;

		applyEventOptions(event);

		let newX: number;
		let newY: number;

		if (exact) {
			newX = event.clientX;
			newY = event.clientY;
		} else {
			newX = event.clientX - offsetX;
			newY = event.clientY - offsetY;
		}

		// Apply axis constraint.
		if (axis === 'x') newY = y;
		if (axis === 'y') newX = x;

		// Clamp to container bounds.
		const clamped = clampPosition(newX, newY);
		x = clamped.x;
		y = clamped.y;

		onMove?.({ x, y }, event);
	}

	function onPointerUp(event: PointerEvent): void {
		if (!isDragging) return;

		applyEventOptions(event);
		isDragging = false;

		onEnd?.({ x, y }, event);
	}

	// ------------------------------------------------------------------
	// Register / cleanup listeners
	// ------------------------------------------------------------------

	$effect(() => {
		if (typeof window === 'undefined') return;
		if (disabled) return;

		const targetEl = resolveElement(target);
		if (!targetEl) return;

		// The handle is the element that initiates the drag; defaults to target.
		const handleEl = resolveElement(handle) ?? targetEl;

		const listenerOpts: AddEventListenerOptions = { capture };

		handleEl.addEventListener('pointerdown', onPointerDown, listenerOpts);
		targetEl.addEventListener('pointermove', onPointerMove, listenerOpts);
		targetEl.addEventListener('pointerup', onPointerUp, listenerOpts);
		targetEl.addEventListener('pointercancel', onPointerUp, listenerOpts);

		return () => {
			handleEl.removeEventListener('pointerdown', onPointerDown, listenerOpts);
			targetEl.removeEventListener('pointermove', onPointerMove, listenerOpts);
			targetEl.removeEventListener('pointerup', onPointerUp, listenerOpts);
			targetEl.removeEventListener('pointercancel', onPointerUp, listenerOpts);
			isDragging = false;
		};
	});

	return {
		x: () => x,
		y: () => y,
		isDragging: () => isDragging,
		style: () => style
	};
}

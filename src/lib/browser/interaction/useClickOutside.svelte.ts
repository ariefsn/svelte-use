export type ClickOutsideEvent = 'click' | 'mousedown' | 'pointerdown';

export interface UseClickOutsideOptions {
	/** The DOM event type to listen for. @default 'pointerdown' */
	event?: ClickOutsideEvent;
}

/**
 * Calls `handler` whenever a pointer event fires outside of `target`.
 *
 * The listener is attached to `document` and compares the event target against
 * the element returned by `target`. Nothing happens when `target` returns a
 * nullish value, making the hook safe to use before the element is mounted and
 * in SSR environments.
 *
 * @param target - Reactive getter that returns the element to watch
 * @param handler - Callback invoked with the triggering event when a click outside occurs
 * @param options - Optional configuration
 * @param options.event - DOM event type to listen for (default: `'pointerdown'`)
 *
 * @example
 * ```ts
 * let el = $state<HTMLElement | null>(null);
 * useClickOutside(
 *   () => el,
 *   () => { open = false; }
 * );
 * ```
 */
export function useClickOutside(
	target: () => HTMLElement | null | undefined,
	handler: (event: MouseEvent | TouchEvent) => void,
	options: UseClickOutsideOptions = {}
): void {
	$effect(() => {
		if (typeof document === 'undefined') return;

		const el = target();
		if (!el) return;

		const eventName = options.event ?? 'pointerdown';

		function onEvent(event: Event) {
			const node = target();
			if (!node) return;
			if (!node.contains(event.target as Node)) {
				handler(event as MouseEvent | TouchEvent);
			}
		}

		document.addEventListener(eventName, onEvent, true);

		return () => {
			document.removeEventListener(eventName, onEvent, true);
		};
	});
}

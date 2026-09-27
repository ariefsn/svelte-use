export type ClickOutsideEvent = 'click' | 'mousedown' | 'pointerdown';

export interface UseClickOutsideOptions {
	/** The DOM event type to listen for. Default `'pointerdown'`. */
	event?: ClickOutsideEvent;
}

/**
 * Calls a handler whenever a pointer event fires outside of the target element. Useful for closing
 * dropdowns, modals, and menus.
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

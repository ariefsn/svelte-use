/**
 * Registers an event listener with automatic cleanup on component destroy.
 *
 * @param target - The event target (window, document, or element)
 * @param event - Event name or array of event names
 * @param handler - Event handler function
 * @param options - Standard addEventListener options
 * @returns A cleanup function to manually remove the listener
 *
 * @example
 * ```ts
 * // Single event
 * useEventListener(window, 'resize', (e) => console.log(e));
 *
 * // Multiple events
 * useEventListener(document, ['mousedown', 'touchstart'], (e) => {
 *   console.log('interaction', e);
 * });
 * ```
 */
export function useEventListener<K extends keyof WindowEventMap>(
	target: Window,
	event: K | K[],
	handler: (ev: WindowEventMap[K]) => void,
	options?: boolean | AddEventListenerOptions
): () => void;
export function useEventListener<K extends keyof DocumentEventMap>(
	target: Document,
	event: K | K[],
	handler: (ev: DocumentEventMap[K]) => void,
	options?: boolean | AddEventListenerOptions
): () => void;
export function useEventListener<K extends keyof HTMLElementEventMap>(
	target: HTMLElement | (() => HTMLElement | null | undefined),
	event: K | K[],
	handler: (ev: HTMLElementEventMap[K]) => void,
	options?: boolean | AddEventListenerOptions
): () => void;
export function useEventListener(
	target: EventTarget | (() => EventTarget | null | undefined),
	event: string | string[],
	handler: (ev: any) => void,
	options?: boolean | AddEventListenerOptions
): () => void {
	const events = Array.isArray(event) ? event : [event];

	function cleanup() {
		const el = typeof target === 'function' ? target() : target;
		if (!el) return;
		for (const e of events) {
			el.removeEventListener(e, handler, options);
		}
	}

	$effect(() => {
		const el = typeof target === 'function' ? target() : target;
		if (!el) return;

		for (const e of events) {
			el.addEventListener(e, handler, options);
		}

		return () => {
			for (const e of events) {
				el.removeEventListener(e, handler, options);
			}
		};
	});

	return cleanup;
}

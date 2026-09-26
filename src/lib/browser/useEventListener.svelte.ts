/* eslint-disable @typescript-eslint/no-explicit-any --
 * `any` appears only in the overload implementation signature. The four
 * public overloads above resolve every supported target to its exact event
 * map, so callers always get a precisely typed event object.
 */

/**
 * The DOM event map for an arbitrary event target.
 *
 * Window/Document/HTMLElement already have dedicated overloads; this covers
 * the targets the library needs beyond them — media devices and streams,
 * message transports, workers and the speech APIs. The fallback arm is
 * `Event` rather than a top type: an unknown target still gets the one thing
 * every listener is guaranteed to receive, and no `unknown` reaches a public
 * signature.
 */
export type EventTargetEventMap<T> = T extends Window
	? WindowEventMap
	: T extends Document
		? DocumentEventMap
		: T extends MediaDevices
			? MediaDevicesEventMap
			: T extends MediaStream
				? MediaStreamEventMap
				: T extends MediaStreamTrack
					? MediaStreamTrackEventMap
					: T extends EventSource
						? EventSourceEventMap
						: T extends BroadcastChannel
							? BroadcastChannelEventMap
							: T extends ScreenOrientation
								? ScreenOrientationEventMap
								: T extends SpeechSynthesis
									? SpeechSynthesisEventMap
									: T extends SpeechSynthesisUtterance
										? SpeechSynthesisUtteranceEventMap
										: T extends Worker
											? WorkerEventMap
											: T extends AbortSignal
												? AbortSignalEventMap
												: T extends HTMLElement
													? HTMLElementEventMap
													: Record<string, Event>;
/**
 * Registers an event listener with automatic cleanup on component destroy.
 *
 * @param target - The event target, or a getter returning one
 *
 * Prefer the getter form for `window` and `document` in code that renders on
 * the server: a bare `window` is evaluated during SSR and throws a
 * `ReferenceError`, while a getter is only called inside the effect, which
 * never runs there.
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
 * // SSR-safe: the getter is only called once the effect runs
 * useEventListener(() => window, 'resize', (e) => console.log(e));
 *
 * // Multiple events
 * useEventListener(document, ['mousedown', 'touchstart'], (e) => {
 *   console.log('interaction', e);
 * });
 * ```
 */
export function useEventListener<K extends keyof WindowEventMap>(
	target: Window | (() => Window | null | undefined),
	event: K | K[],
	handler: (ev: WindowEventMap[K]) => void,
	options?: boolean | AddEventListenerOptions
): () => void;
export function useEventListener<K extends keyof DocumentEventMap>(
	target: Document | (() => Document | null | undefined),
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
/**
 * Any other event target — `navigator.mediaDevices`, an `EventSource`, a
 * `BroadcastChannel`, `screen.orientation`, a `Worker`, a `MediaStreamTrack`
 * and so on. Declared last so the three overloads above keep resolving
 * exactly as they did before.
 */
export function useEventListener<
	T extends EventTarget,
	K extends keyof EventTargetEventMap<T> & string
>(
	target: T | (() => T | null | undefined),
	event: K | K[],
	handler: (ev: EventTargetEventMap<T>[K]) => void,
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

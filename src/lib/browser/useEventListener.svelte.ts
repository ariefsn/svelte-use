/* eslint-disable @typescript-eslint/no-explicit-any --
 * `any` appears only in the overload implementation signature. The four public overloads
 * above resolve every supported target to its exact event map.
 */

/** The DOM event map for an arbitrary event target. */
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
/** Generic event listener utility with automatic cleanup on component destroy. */
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
/** Generic event listener utility with automatic cleanup on component destroy. */
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

/**
 * Turns `target` into a file drop zone and tracks whether a drag is currently over it.
 *
 * Listens for `dragenter`, `dragleave`, `dragover`, and `drop` events on the
 * element returned by `target`. Default browser behavior is suppressed on
 * `dragover` and `drop` to allow custom handling. When files are dropped,
 * `onDrop` is called with the array of `File` objects from the event's
 * `dataTransfer`.
 *
 * Counter-based enter/leave tracking is used to handle the case where the
 * pointer moves over a child element, which would otherwise cause spurious
 * `dragleave` events. The counter is reset on `drop` and cleanup.
 *
 * The hook is a no-op in SSR environments or when `target` is nullish.
 *
 * @param target - Reactive getter that returns the drop-zone element
 * @param onDrop - Optional callback invoked with dropped files
 * @returns Object with an `isOver` getter that is `true` while a drag is over the element
 *
 * @example
 * ```ts
 * let zone = $state<HTMLElement | null>(null);
 * const { isOver } = useDropZone(() => zone, (files) => upload(files));
 * ```
 */
export function useDropZone(
	target: () => HTMLElement | null | undefined,
	onDrop?: (files: File[]) => void
): {
	isOver: () => boolean;
} {
	let isOver = $state(false);

	$effect(() => {
		if (typeof document === 'undefined') return;

		const el = target();
		if (!el) return;

		let enterCount = 0;

		function onDragEnter(event: DragEvent) {
			event.preventDefault();
			enterCount++;
			isOver = true;
		}

		function onDragLeave(event: DragEvent) {
			event.preventDefault();
			enterCount--;
			if (enterCount <= 0) {
				enterCount = 0;
				isOver = false;
			}
		}

		function onDragOver(event: DragEvent) {
			event.preventDefault();
		}

		function onDropEvent(event: DragEvent) {
			event.preventDefault();
			enterCount = 0;
			isOver = false;
			if (onDrop) {
				const files = event.dataTransfer ? Array.from(event.dataTransfer.files) : [];
				onDrop(files);
			}
		}

		el.addEventListener('dragenter', onDragEnter);
		el.addEventListener('dragleave', onDragLeave);
		el.addEventListener('dragover', onDragOver);
		el.addEventListener('drop', onDropEvent);

		return () => {
			el.removeEventListener('dragenter', onDragEnter);
			el.removeEventListener('dragleave', onDragLeave);
			el.removeEventListener('dragover', onDragOver);
			el.removeEventListener('drop', onDropEvent);
			enterCount = 0;
			isOver = false;
		};
	});

	return {
		isOver: () => isOver
	};
}

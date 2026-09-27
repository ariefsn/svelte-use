/**
 * Turns any element into a file drop zone. Tracks whether a drag is currently over the element and
 * calls `onDrop` with the dropped `File` objects.
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

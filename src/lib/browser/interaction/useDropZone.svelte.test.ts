import { flushSync } from 'svelte';
import { describe, expect, test, vi } from 'vitest';
import { useDropZone } from './useDropZone.svelte.js';

function makeDragEvent(type: string, files: File[] = []): DragEvent {
	const dt = new DataTransfer();
	for (const file of files) {
		dt.items.add(file);
	}
	return new DragEvent(type, { bubbles: true, dataTransfer: dt });
}

describe('useDropZone', () => {
	test('starts as not over', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		const cleanup = $effect.root(() => {
			const { isOver } = useDropZone(() => el);
			expect(isOver()).toBe(false);
		});

		el.remove();
		cleanup();
	});

	test('isOver becomes true on dragenter', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		let result!: ReturnType<typeof useDropZone>;

		const cleanup = $effect.root(() => {
			result = useDropZone(() => el);
		});

		flushSync();

		el.dispatchEvent(makeDragEvent('dragenter'));
		expect(result.isOver()).toBe(true);

		el.remove();
		cleanup();
	});

	test('isOver becomes false on dragleave', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		let result!: ReturnType<typeof useDropZone>;

		const cleanup = $effect.root(() => {
			result = useDropZone(() => el);
		});

		flushSync();

		el.dispatchEvent(makeDragEvent('dragenter'));
		expect(result.isOver()).toBe(true);

		el.dispatchEvent(makeDragEvent('dragleave'));
		expect(result.isOver()).toBe(false);

		el.remove();
		cleanup();
	});

	test('nested enter/leave are balanced via counter', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		let result!: ReturnType<typeof useDropZone>;

		const cleanup = $effect.root(() => {
			result = useDropZone(() => el);
		});

		flushSync();

		// Enter parent then child → count = 2
		el.dispatchEvent(makeDragEvent('dragenter'));
		el.dispatchEvent(makeDragEvent('dragenter'));
		expect(result.isOver()).toBe(true);

		// Leave child → count = 1, still over
		el.dispatchEvent(makeDragEvent('dragleave'));
		expect(result.isOver()).toBe(true);

		// Leave parent → count = 0, not over
		el.dispatchEvent(makeDragEvent('dragleave'));
		expect(result.isOver()).toBe(false);

		el.remove();
		cleanup();
	});

	test('isOver becomes false on drop', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		let result!: ReturnType<typeof useDropZone>;

		const cleanup = $effect.root(() => {
			result = useDropZone(() => el);
		});

		flushSync();

		el.dispatchEvent(makeDragEvent('dragenter'));
		expect(result.isOver()).toBe(true);

		el.dispatchEvent(makeDragEvent('drop'));
		expect(result.isOver()).toBe(false);

		el.remove();
		cleanup();
	});

	test('calls onDrop with files when files are dropped', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		const onDrop = vi.fn();
		const file = new File(['hello'], 'test.txt', { type: 'text/plain' });

		const cleanup = $effect.root(() => {
			useDropZone(() => el, onDrop);
		});

		flushSync();

		el.dispatchEvent(makeDragEvent('drop', [file]));

		expect(onDrop).toHaveBeenCalledTimes(1);
		const droppedFiles: File[] = onDrop.mock.calls[0][0];
		expect(droppedFiles).toHaveLength(1);
		expect(droppedFiles[0].name).toBe('test.txt');

		el.remove();
		cleanup();
	});

	test('calls onDrop with empty array when no files are present', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		const onDrop = vi.fn();

		const cleanup = $effect.root(() => {
			useDropZone(() => el, onDrop);
		});

		flushSync();

		el.dispatchEvent(makeDragEvent('drop', []));
		expect(onDrop).toHaveBeenCalledWith([]);

		el.remove();
		cleanup();
	});

	test('does not throw when onDrop is not provided', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		const cleanup = $effect.root(() => {
			useDropZone(() => el);
		});

		flushSync();

		expect(() => el.dispatchEvent(makeDragEvent('drop'))).not.toThrow();

		el.remove();
		cleanup();
	});

	test('returns false when target is null', () => {
		const cleanup = $effect.root(() => {
			const { isOver } = useDropZone(() => null);
			flushSync();
			expect(isOver()).toBe(false);
		});

		cleanup();
	});

	test('removes listeners on cleanup and resets isOver', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		const onDrop = vi.fn();
		let result!: ReturnType<typeof useDropZone>;

		const cleanup = $effect.root(() => {
			result = useDropZone(() => el, onDrop);
		});

		flushSync();

		el.dispatchEvent(makeDragEvent('dragenter'));
		expect(result.isOver()).toBe(true);

		cleanup();

		expect(result.isOver()).toBe(false);

		// Events after cleanup should not fire handler or change state
		el.dispatchEvent(makeDragEvent('drop'));
		expect(onDrop).not.toHaveBeenCalled();
		expect(result.isOver()).toBe(false);

		el.remove();
	});

	test('two independent instances do not interfere', () => {
		const elA = document.createElement('div');
		const elB = document.createElement('div');
		document.body.appendChild(elA);
		document.body.appendChild(elB);

		const onDropA = vi.fn();
		const onDropB = vi.fn();
		let a!: ReturnType<typeof useDropZone>;
		let b!: ReturnType<typeof useDropZone>;

		const cleanup = $effect.root(() => {
			a = useDropZone(() => elA, onDropA);
			b = useDropZone(() => elB, onDropB);
		});

		flushSync();

		elA.dispatchEvent(makeDragEvent('dragenter'));
		expect(a.isOver()).toBe(true);
		expect(b.isOver()).toBe(false);

		const file = new File(['x'], 'x.txt');
		elA.dispatchEvent(makeDragEvent('drop', [file]));
		expect(onDropA).toHaveBeenCalledTimes(1);
		expect(onDropB).not.toHaveBeenCalled();

		elA.remove();
		elB.remove();
		cleanup();
	});
});

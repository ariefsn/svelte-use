import { flushSync } from 'svelte';
import { describe, expect, test, vi } from 'vitest';
import { usePageLeave } from './usePageLeave.svelte.js';

describe('usePageLeave', () => {
	test('returns false initially (mouse inside viewport)', () => {
		const cleanup = $effect.root(() => {
			const hasLeft = usePageLeave();
			expect(hasLeft()).toBe(false);
		});
		cleanup();
	});

	test('returns true when mouseleave fires on document', () => {
		const cleanup = $effect.root(() => {
			const hasLeft = usePageLeave();
			flushSync();

			document.dispatchEvent(new MouseEvent('mouseleave'));
			flushSync();

			expect(hasLeft()).toBe(true);
		});
		cleanup();
	});

	test('returns false again when mouseenter fires after leaving', () => {
		const cleanup = $effect.root(() => {
			const hasLeft = usePageLeave();
			flushSync();

			document.dispatchEvent(new MouseEvent('mouseleave'));
			flushSync();
			expect(hasLeft()).toBe(true);

			document.dispatchEvent(new MouseEvent('mouseenter'));
			flushSync();
			expect(hasLeft()).toBe(false);
		});
		cleanup();
	});

	test('toggles correctly through multiple leave/enter cycles', () => {
		const cleanup = $effect.root(() => {
			const hasLeft = usePageLeave();
			flushSync();

			for (let i = 0; i < 3; i++) {
				document.dispatchEvent(new MouseEvent('mouseleave'));
				flushSync();
				expect(hasLeft()).toBe(true);

				document.dispatchEvent(new MouseEvent('mouseenter'));
				flushSync();
				expect(hasLeft()).toBe(false);
			}
		});
		cleanup();
	});

	test('cleanup removes event listeners', () => {
		const addSpy = vi.spyOn(document, 'addEventListener');
		const removeSpy = vi.spyOn(document, 'removeEventListener');

		const cleanup = $effect.root(() => {
			usePageLeave();
			flushSync();
		});

		cleanup();
		flushSync();

		expect(addSpy).toHaveBeenCalledWith('mouseleave', expect.any(Function));
		expect(addSpy).toHaveBeenCalledWith('mouseenter', expect.any(Function));
		expect(removeSpy).toHaveBeenCalledWith('mouseleave', expect.any(Function));
		expect(removeSpy).toHaveBeenCalledWith('mouseenter', expect.any(Function));

		addSpy.mockRestore();
		removeSpy.mockRestore();
	});

	test('does not react to window-level mouse events', () => {
		const cleanup = $effect.root(() => {
			const hasLeft = usePageLeave();
			flushSync();

			window.dispatchEvent(new MouseEvent('mouseleave'));
			flushSync();

			expect(hasLeft()).toBe(false);
		});
		cleanup();
	});

	test('multiple instances are independent', () => {
		const cleanup = $effect.root(() => {
			const a = usePageLeave();
			const b = usePageLeave();
			flushSync();

			document.dispatchEvent(new MouseEvent('mouseleave'));
			flushSync();

			expect(a()).toBe(true);
			expect(b()).toBe(true);

			document.dispatchEvent(new MouseEvent('mouseenter'));
			flushSync();

			expect(a()).toBe(false);
			expect(b()).toBe(false);
		});
		cleanup();
	});
});

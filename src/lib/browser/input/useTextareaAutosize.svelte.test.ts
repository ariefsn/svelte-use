import { flushSync } from 'svelte';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { useTextareaAutosize } from './useTextareaAutosize.svelte.js';

/**
 * Creates a textarea whose scrollHeight is driven by its value, standing in
 * for real text layout: 20px per line plus 10px of padding.
 */
function textarea(): HTMLTextAreaElement {
	const el = document.createElement('textarea');
	el.style.lineHeight = '20px';
	el.style.padding = '5px';
	el.style.border = '0';
	document.body.appendChild(el);

	Object.defineProperty(el, 'scrollHeight', {
		configurable: true,
		get() {
			const lines = Math.max(1, el.value.split('\n').length);
			return lines * 20 + 10;
		}
	});

	return el;
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe('useTextareaAutosize', () => {
	test('sets the height to fit the content', () => {
		const el = textarea();
		el.value = 'one\ntwo\nthree';

		const cleanup = $effect.root(() => {
			useTextareaAutosize(() => el);
			flushSync();
		});

		expect(el.style.height).toBe('70px'); // 3 lines * 20 + 10
		cleanup();
		el.remove();
	});

	test('reports the applied height', () => {
		const el = textarea();
		el.value = 'a\nb';

		const cleanup = $effect.root(() => {
			const { height } = useTextareaAutosize(() => el);
			flushSync();
			expect(height()).toBe(50);
		});

		cleanup();
		el.remove();
	});

	test('grows on input', () => {
		const el = textarea();
		el.value = 'one';

		const cleanup = $effect.root(() => {
			useTextareaAutosize(() => el);
			flushSync();
			expect(el.style.height).toBe('30px');

			el.value = 'one\ntwo\nthree\nfour';
			el.dispatchEvent(new Event('input'));

			expect(el.style.height).toBe('90px');
		});

		cleanup();
		el.remove();
	});

	test('shrinks when content is removed', () => {
		// Only works because the height is collapsed before measuring —
		// scrollHeight never reports less than the current height.
		const el = textarea();
		el.value = 'one\ntwo\nthree\nfour\nfive';

		const cleanup = $effect.root(() => {
			useTextareaAutosize(() => el);
			flushSync();
			expect(el.style.height).toBe('110px');

			el.value = 'one';
			el.dispatchEvent(new Event('input'));

			expect(el.style.height).toBe('30px');
		});

		cleanup();
		el.remove();
	});

	test('resizes when the reactive value changes without an input event', () => {
		const el = textarea();

		const cleanup = $effect.root(() => {
			let text = $state('one');
			// Keep the DOM value in step with the reactive one, as bind:value would.
			$effect(() => {
				el.value = text;
			});

			useTextareaAutosize(() => el, { value: () => text });
			flushSync();
			expect(el.style.height).toBe('30px');

			// A programmatic assignment fires no 'input' event.
			text = 'one\ntwo\nthree';
			flushSync();

			expect(el.style.height).toBe('70px');
		});

		cleanup();
		el.remove();
	});

	test('clamps to maxRows and enables scrolling', () => {
		const el = textarea();
		el.value = Array.from({ length: 20 }, (_, i) => `line ${i}`).join('\n');

		const cleanup = $effect.root(() => {
			useTextareaAutosize(() => el, { maxRows: 3 });
			flushSync();
		});

		// 3 rows * 20px + 10px padding
		expect(el.style.height).toBe('70px');
		expect(el.style.overflowY).toBe('auto');

		cleanup();
		el.remove();
	});

	test('enforces minRows', () => {
		const el = textarea();
		el.value = 'one';

		const cleanup = $effect.root(() => {
			useTextareaAutosize(() => el, { minRows: 4 });
			flushSync();
		});

		expect(el.style.height).toBe('90px'); // 4 rows, not 1
		cleanup();
		el.remove();
	});

	test('hides the scrollbar when content fits under maxRows', () => {
		const el = textarea();
		el.value = 'one';

		const cleanup = $effect.root(() => {
			useTextareaAutosize(() => el, { maxRows: 10 });
			flushSync();
		});

		expect(el.style.overflowY).toBe('hidden');
		cleanup();
		el.remove();
	});

	test('writes minHeight when styleProp says so', () => {
		const el = textarea();
		el.value = 'one\ntwo';

		const cleanup = $effect.root(() => {
			useTextareaAutosize(() => el, { styleProp: 'minHeight' });
			flushSync();
		});

		expect(el.style.minHeight).toBe('50px');
		expect(el.style.height).toBe('');

		cleanup();
		el.remove();
	});

	test('recalculates on window resize', () => {
		const el = textarea();
		el.value = 'one';

		const cleanup = $effect.root(() => {
			useTextareaAutosize(() => el);
			flushSync();
			expect(el.style.height).toBe('30px');

			// Narrower window → more wrapped lines.
			el.value = 'one\ntwo';
			window.dispatchEvent(new Event('resize'));

			expect(el.style.height).toBe('50px');
		});

		cleanup();
		el.remove();
	});

	test('resize() works on demand', () => {
		const el = textarea();
		el.value = 'one';

		const cleanup = $effect.root(() => {
			const { resize } = useTextareaAutosize(() => el);
			flushSync();

			el.value = 'one\ntwo\nthree';
			resize();

			expect(el.style.height).toBe('70px');
		});

		cleanup();
		el.remove();
	});

	test('does nothing without a target', () => {
		const cleanup = $effect.root(() => {
			const { height } = useTextareaAutosize(() => null);
			flushSync();
			expect(height()).toBe(0);
		});
		cleanup();
	});

	test('stops resizing after the scope is destroyed', () => {
		const el = textarea();
		el.value = 'one';

		const cleanup = $effect.root(() => {
			useTextareaAutosize(() => el);
			flushSync();
		});

		cleanup();

		el.value = 'one\ntwo\nthree\nfour';
		el.dispatchEvent(new Event('input'));

		expect(el.style.height).toBe('30px');
		el.remove();
	});
});

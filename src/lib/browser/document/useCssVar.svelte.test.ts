import { flushSync } from 'svelte';
import { afterEach, describe, expect, test } from 'vitest';
import { useCssVar } from './useCssVar.svelte.js';

const created: HTMLElement[] = [];

function element(): HTMLElement {
	const div = document.createElement('div');
	document.body.appendChild(div);
	created.push(div);
	return div;
}

afterEach(() => {
	for (const node of created.splice(0)) node.remove();
	document.documentElement.style.removeProperty('--test-root');
});

describe('useCssVar', () => {
	test('reads an inline custom property', () => {
		const target = element();
		target.style.setProperty('--gap', '12px');

		const cleanup = $effect.root(() => {
			const gap = useCssVar('--gap', () => target);
			// Read synchronously at initialisation, before any effect runs.
			expect(gap.current()).toBe('12px');
		});
		cleanup();
	});

	test('trims the value', () => {
		const target = element();
		// Custom property values preserve leading whitespace, which would stop
		// the result comparing equal to what was written.
		target.setAttribute('style', '--pad:   8px  ');

		const cleanup = $effect.root(() => {
			const pad = useCssVar('--pad', () => target);
			expect(pad.current()).toBe('8px');
		});
		cleanup();
	});

	test('falls back to initialValue when unset', () => {
		const target = element();

		const cleanup = $effect.root(() => {
			const missing = useCssVar('--absent', () => target, { initialValue: 'fallback' });
			expect(missing.current()).toBe('fallback');
		});
		cleanup();
	});

	test('defaults initialValue to the empty string', () => {
		const target = element();

		const cleanup = $effect.root(() => {
			const missing = useCssVar('--absent', () => target);
			expect(missing.current()).toBe('');
		});
		cleanup();
	});

	test('set() writes the property and the value together', () => {
		const target = element();

		const cleanup = $effect.root(() => {
			const accent = useCssVar('--accent', () => target);
			accent.set('tomato');

			// Write-through is authoritative and needs no recalculation.
			expect(accent.current()).toBe('tomato');
			expect(target.style.getPropertyValue('--accent')).toBe('tomato');
		});
		cleanup();
	});

	test('remove() clears the inline property and re-reads', () => {
		const target = element();
		target.style.setProperty('--accent', 'tomato');

		const cleanup = $effect.root(() => {
			const accent = useCssVar('--accent', () => target, { initialValue: 'none' });
			expect(accent.current()).toBe('tomato');

			accent.remove();

			expect(target.style.getPropertyValue('--accent')).toBe('');
			expect(accent.current()).toBe('none');
		});
		cleanup();
	});

	test('refresh() picks up a change made outside the composable', () => {
		const target = element();
		target.style.setProperty('--size', '1px');

		const cleanup = $effect.root(() => {
			const size = useCssVar('--size', () => target);
			expect(size.current()).toBe('1px');

			// Bypasses the composable entirely — the documented escape hatch.
			target.style.setProperty('--size', '9px');
			expect(size.current()).toBe('1px');

			size.refresh();
			expect(size.current()).toBe('9px');
		});
		cleanup();
	});

	test('re-reads when a reactive name changes', () => {
		const target = element();
		target.style.setProperty('--a', 'first');
		target.style.setProperty('--b', 'second');

		const cleanup = $effect.root(() => {
			let which = $state('--a');
			const value = useCssVar(
				() => which,
				() => target
			);
			flushSync();
			expect(value.current()).toBe('first');

			which = '--b';
			flushSync();
			expect(value.current()).toBe('second');
		});
		cleanup();
	});

	test('defaults its target to the document element', () => {
		document.documentElement.style.setProperty('--test-root', 'rooted');

		const cleanup = $effect.root(() => {
			const value = useCssVar('--test-root');
			expect(value.current()).toBe('rooted');
		});
		cleanup();
	});

	test('inherits a value from an ancestor', () => {
		const parent = element();
		const child = document.createElement('div');
		parent.appendChild(child);
		parent.style.setProperty('--inherited', 'from-parent');

		const cleanup = $effect.root(() => {
			const value = useCssVar('--inherited', () => child);
			// getComputedStyle resolves inheritance, unlike reading style directly.
			expect(value.current()).toBe('from-parent');
		});
		cleanup();
	});

	test('observe: true reacts to a class change on the target', async () => {
		// The case that matters in practice: a theme class flipping on an
		// ancestor, which is how useColorMode drives token values.
		const style = document.createElement('style');
		style.textContent = '.themed { --observed: themed-value; }';
		document.head.appendChild(style);

		const target = element();

		let value!: ReturnType<typeof useCssVar>;
		const cleanup = $effect.root(() => {
			value = useCssVar('--observed', () => target, { observe: true, initialValue: 'unset' });
			flushSync();
		});

		expect(value.current()).toBe('unset');

		target.classList.add('themed');
		// MutationObserver delivers on a microtask.
		await Promise.resolve();
		flushSync();

		expect(value.current()).toBe('themed-value');

		cleanup();
		style.remove();
	});

	test('without observe, a class change is not picked up', () => {
		const style = document.createElement('style');
		style.textContent = '.themed-2 { --unobserved: themed-value; }';
		document.head.appendChild(style);

		const target = element();

		const cleanup = $effect.root(() => {
			const value = useCssVar('--unobserved', () => target, { initialValue: 'unset' });
			flushSync();

			target.classList.add('themed-2');
			flushSync();

			// Deliberate: no observer, so nothing re-reads until refresh().
			expect(value.current()).toBe('unset');
			value.refresh();
			expect(value.current()).toBe('themed-value');
		});

		cleanup();
		style.remove();
	});

	test('returns initialValue for a null target', () => {
		const cleanup = $effect.root(() => {
			const value = useCssVar('--whatever', () => null, { initialValue: 'safe' });
			expect(value.current()).toBe('safe');
		});
		cleanup();
	});
});

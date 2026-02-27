import { flushSync } from 'svelte';
import { describe, expect, test } from 'vitest';
import { useFocus } from './useFocus.svelte.js';

describe('useFocus', () => {
	test('starts as not focused', () => {
		const el = document.createElement('input');
		document.body.appendChild(el);

		const cleanup = $effect.root(() => {
			const { focused } = useFocus(() => el);
			expect(focused()).toBe(false);
		});

		el.remove();
		cleanup();
	});

	test('focused becomes true on focus event', () => {
		const el = document.createElement('input');
		document.body.appendChild(el);

		let result!: ReturnType<typeof useFocus>;

		const cleanup = $effect.root(() => {
			result = useFocus(() => el);
		});

		flushSync();

		el.dispatchEvent(new FocusEvent('focus'));
		expect(result.focused()).toBe(true);

		el.remove();
		cleanup();
	});

	test('focused becomes false on blur event', () => {
		const el = document.createElement('input');
		document.body.appendChild(el);

		let result!: ReturnType<typeof useFocus>;

		const cleanup = $effect.root(() => {
			result = useFocus(() => el);
		});

		flushSync();

		el.dispatchEvent(new FocusEvent('focus'));
		expect(result.focused()).toBe(true);

		el.dispatchEvent(new FocusEvent('blur'));
		expect(result.focused()).toBe(false);

		el.remove();
		cleanup();
	});

	test('returns false when target is null', () => {
		const cleanup = $effect.root(() => {
			const { focused } = useFocus(() => null);
			flushSync();
			expect(focused()).toBe(false);
		});

		cleanup();
	});

	test('returns false when target is undefined', () => {
		const cleanup = $effect.root(() => {
			const { focused } = useFocus(() => undefined);
			flushSync();
			expect(focused()).toBe(false);
		});

		cleanup();
	});

	test('removes listeners on cleanup and resets focused to false', () => {
		const el = document.createElement('input');
		document.body.appendChild(el);

		let result!: ReturnType<typeof useFocus>;

		const cleanup = $effect.root(() => {
			result = useFocus(() => el);
		});

		flushSync();

		el.dispatchEvent(new FocusEvent('focus'));
		expect(result.focused()).toBe(true);

		cleanup();

		expect(result.focused()).toBe(false);

		// Events after cleanup should not change state
		el.dispatchEvent(new FocusEvent('focus'));
		expect(result.focused()).toBe(false);

		el.remove();
	});

	test('two independent instances do not interfere', () => {
		const elA = document.createElement('input');
		const elB = document.createElement('input');
		document.body.appendChild(elA);
		document.body.appendChild(elB);

		let a!: ReturnType<typeof useFocus>;
		let b!: ReturnType<typeof useFocus>;

		const cleanup = $effect.root(() => {
			a = useFocus(() => elA);
			b = useFocus(() => elB);
		});

		flushSync();

		elA.dispatchEvent(new FocusEvent('focus'));
		expect(a.focused()).toBe(true);
		expect(b.focused()).toBe(false);

		elA.dispatchEvent(new FocusEvent('blur'));
		elB.dispatchEvent(new FocusEvent('focus'));
		expect(a.focused()).toBe(false);
		expect(b.focused()).toBe(true);

		elA.remove();
		elB.remove();
		cleanup();
	});

	test('re-attaches listeners when target element changes', () => {
		const el1 = document.createElement('input');
		const el2 = document.createElement('input');
		document.body.appendChild(el1);
		document.body.appendChild(el2);

		let targetEl = $state<HTMLElement>(el1);
		let result!: ReturnType<typeof useFocus>;

		const cleanup = $effect.root(() => {
			result = useFocus(() => targetEl);
		});

		flushSync();

		el1.dispatchEvent(new FocusEvent('focus'));
		expect(result.focused()).toBe(true);

		targetEl = el2;
		flushSync();

		// focused resets after target switch
		expect(result.focused()).toBe(false);

		el2.dispatchEvent(new FocusEvent('focus'));
		expect(result.focused()).toBe(true);

		el1.remove();
		el2.remove();
		cleanup();
	});
});

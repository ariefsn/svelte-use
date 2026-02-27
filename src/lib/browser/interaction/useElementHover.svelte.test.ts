import { flushSync } from 'svelte';
import { describe, expect, test } from 'vitest';
import { useElementHover } from './useElementHover.svelte.js';

describe('useElementHover', () => {
	test('starts as not hovering', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		const cleanup = $effect.root(() => {
			const { hovering } = useElementHover(() => el);
			expect(hovering()).toBe(false);
		});

		el.remove();
		cleanup();
	});

	test('hovering becomes true on mouseenter', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		let result!: ReturnType<typeof useElementHover>;

		const cleanup = $effect.root(() => {
			result = useElementHover(() => el);
		});

		flushSync();

		el.dispatchEvent(new MouseEvent('mouseenter'));
		expect(result.hovering()).toBe(true);

		el.remove();
		cleanup();
	});

	test('hovering becomes false on mouseleave', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		let result!: ReturnType<typeof useElementHover>;

		const cleanup = $effect.root(() => {
			result = useElementHover(() => el);
		});

		flushSync();

		el.dispatchEvent(new MouseEvent('mouseenter'));
		expect(result.hovering()).toBe(true);

		el.dispatchEvent(new MouseEvent('mouseleave'));
		expect(result.hovering()).toBe(false);

		el.remove();
		cleanup();
	});

	test('returns false when target is null', () => {
		const cleanup = $effect.root(() => {
			const { hovering } = useElementHover(() => null);
			flushSync();
			expect(hovering()).toBe(false);
		});

		cleanup();
	});

	test('returns false when target is undefined', () => {
		const cleanup = $effect.root(() => {
			const { hovering } = useElementHover(() => undefined);
			flushSync();
			expect(hovering()).toBe(false);
		});

		cleanup();
	});

	test('removes listeners on cleanup and resets hovering to false', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		let result!: ReturnType<typeof useElementHover>;

		const cleanup = $effect.root(() => {
			result = useElementHover(() => el);
		});

		flushSync();

		el.dispatchEvent(new MouseEvent('mouseenter'));
		expect(result.hovering()).toBe(true);

		cleanup();

		// After cleanup hovering is reset
		expect(result.hovering()).toBe(false);

		// Event fired after cleanup should not change state
		el.dispatchEvent(new MouseEvent('mouseenter'));
		expect(result.hovering()).toBe(false);

		el.remove();
	});

	test('two independent instances do not interfere', () => {
		const elA = document.createElement('div');
		const elB = document.createElement('div');
		document.body.appendChild(elA);
		document.body.appendChild(elB);

		let a!: ReturnType<typeof useElementHover>;
		let b!: ReturnType<typeof useElementHover>;

		const cleanup = $effect.root(() => {
			a = useElementHover(() => elA);
			b = useElementHover(() => elB);
		});

		flushSync();

		elA.dispatchEvent(new MouseEvent('mouseenter'));
		expect(a.hovering()).toBe(true);
		expect(b.hovering()).toBe(false);

		elB.dispatchEvent(new MouseEvent('mouseenter'));
		expect(a.hovering()).toBe(true);
		expect(b.hovering()).toBe(true);

		elA.dispatchEvent(new MouseEvent('mouseleave'));
		expect(a.hovering()).toBe(false);
		expect(b.hovering()).toBe(true);

		elA.remove();
		elB.remove();
		cleanup();
	});

	test('re-attaches listeners when target element changes', () => {
		const el1 = document.createElement('div');
		const el2 = document.createElement('div');
		document.body.appendChild(el1);
		document.body.appendChild(el2);

		let targetEl = $state<HTMLElement>(el1);
		let result!: ReturnType<typeof useElementHover>;

		const cleanup = $effect.root(() => {
			result = useElementHover(() => targetEl);
		});

		flushSync();

		el1.dispatchEvent(new MouseEvent('mouseenter'));
		expect(result.hovering()).toBe(true);

		// Switch target — should reset and track new element
		targetEl = el2;
		flushSync();

		// hovering reset after target switch
		expect(result.hovering()).toBe(false);

		el2.dispatchEvent(new MouseEvent('mouseenter'));
		expect(result.hovering()).toBe(true);

		el1.remove();
		el2.remove();
		cleanup();
	});
});

import { flushSync } from 'svelte';
import { describe, expect, test, vi } from 'vitest';
import { useClickOutside } from './useClickOutside.svelte.js';

describe('useClickOutside', () => {
	test('calls handler when clicking outside the target', () => {
		const handler = vi.fn();
		const inside = document.createElement('div');
		const outside = document.createElement('div');
		document.body.appendChild(inside);
		document.body.appendChild(outside);

		const cleanup = $effect.root(() => {
			useClickOutside(() => inside, handler);
		});

		flushSync();

		outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		expect(handler).toHaveBeenCalledTimes(1);

		inside.remove();
		outside.remove();
		cleanup();
	});

	test('does not call handler when clicking inside the target', () => {
		const handler = vi.fn();
		const target = document.createElement('div');
		const child = document.createElement('span');
		target.appendChild(child);
		document.body.appendChild(target);

		const cleanup = $effect.root(() => {
			useClickOutside(() => target, handler);
		});

		flushSync();

		child.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		expect(handler).not.toHaveBeenCalled();

		target.remove();
		cleanup();
	});

	test('does not call handler when clicking the target element itself', () => {
		const handler = vi.fn();
		const target = document.createElement('div');
		document.body.appendChild(target);

		const cleanup = $effect.root(() => {
			useClickOutside(() => target, handler);
		});

		flushSync();

		target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		expect(handler).not.toHaveBeenCalled();

		target.remove();
		cleanup();
	});

	test('uses custom event type when provided', () => {
		const handler = vi.fn();
		const inside = document.createElement('div');
		const outside = document.createElement('div');
		document.body.appendChild(inside);
		document.body.appendChild(outside);

		const cleanup = $effect.root(() => {
			useClickOutside(() => inside, handler, { event: 'mousedown' });
		});

		flushSync();

		// pointerdown should NOT trigger since we registered mousedown
		outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		expect(handler).not.toHaveBeenCalled();

		// mousedown should trigger
		outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
		expect(handler).toHaveBeenCalledTimes(1);

		inside.remove();
		outside.remove();
		cleanup();
	});

	test('uses click event type when provided', () => {
		const handler = vi.fn();
		const inside = document.createElement('div');
		const outside = document.createElement('div');
		document.body.appendChild(inside);
		document.body.appendChild(outside);

		const cleanup = $effect.root(() => {
			useClickOutside(() => inside, handler, { event: 'click' });
		});

		flushSync();

		outside.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		expect(handler).toHaveBeenCalledTimes(1);

		inside.remove();
		outside.remove();
		cleanup();
	});

	test('does nothing when target is null', () => {
		const handler = vi.fn();

		const cleanup = $effect.root(() => {
			useClickOutside(() => null, handler);
		});

		flushSync();

		document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		expect(handler).not.toHaveBeenCalled();

		cleanup();
	});

	test('does nothing when target is undefined', () => {
		const handler = vi.fn();

		const cleanup = $effect.root(() => {
			useClickOutside(() => undefined, handler);
		});

		flushSync();

		document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		expect(handler).not.toHaveBeenCalled();

		cleanup();
	});

	test('removes listener on cleanup', () => {
		const handler = vi.fn();
		const inside = document.createElement('div');
		const outside = document.createElement('div');
		document.body.appendChild(inside);
		document.body.appendChild(outside);

		const cleanup = $effect.root(() => {
			useClickOutside(() => inside, handler);
		});

		flushSync();
		cleanup();

		outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		expect(handler).not.toHaveBeenCalled();

		inside.remove();
		outside.remove();
	});

	test('re-registers listener when target changes', () => {
		const handler = vi.fn();
		const el1 = document.createElement('div');
		const el2 = document.createElement('div');
		const outside = document.createElement('div');
		document.body.appendChild(el1);
		document.body.appendChild(el2);
		document.body.appendChild(outside);

		let targetEl = $state<HTMLElement>(el1);

		const cleanup = $effect.root(() => {
			useClickOutside(() => targetEl, handler);
		});

		flushSync();

		// click outside el1 → fires handler
		outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		expect(handler).toHaveBeenCalledTimes(1);

		// switch target to el2, click outside el2 → still fires handler
		targetEl = el2;
		flushSync();

		outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		expect(handler).toHaveBeenCalledTimes(2);

		el1.remove();
		el2.remove();
		outside.remove();
		cleanup();
	});
});

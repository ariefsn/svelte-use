import { flushSync } from 'svelte';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { useScroll } from './useScroll.svelte.js';

/**
 * Creates a scrollable `HTMLElement` stub with configurable scroll metrics.
 */
function makeScrollable(
	overrides: Partial<{
		scrollLeft: number;
		scrollTop: number;
		scrollWidth: number;
		scrollHeight: number;
		clientWidth: number;
		clientHeight: number;
	}> = {}
): HTMLElement {
	const el = document.createElement('div');
	Object.defineProperties(el, {
		scrollLeft: { writable: true, value: overrides.scrollLeft ?? 0 },
		scrollTop: { writable: true, value: overrides.scrollTop ?? 0 },
		scrollWidth: { writable: true, value: overrides.scrollWidth ?? 1000 },
		scrollHeight: { writable: true, value: overrides.scrollHeight ?? 1000 },
		clientWidth: { writable: true, value: overrides.clientWidth ?? 300 },
		clientHeight: { writable: true, value: overrides.clientHeight ?? 300 }
	});
	return el;
}

function fireScroll(el: HTMLElement | Window) {
	el.dispatchEvent(new Event('scroll', { bubbles: false }));
}

describe('useScroll', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	test('initialises x and y to 0', () => {
		const el = makeScrollable();
		document.body.appendChild(el);

		const cleanup = $effect.root(() => {
			const scroll = useScroll(el);
			flushSync();
			expect(scroll.x()).toBe(0);
			expect(scroll.y()).toBe(0);
		});

		el.remove();
		cleanup();
	});

	test('updates x and y on scroll', () => {
		const el = makeScrollable();
		document.body.appendChild(el);

		let scroll!: ReturnType<typeof useScroll>;

		const cleanup = $effect.root(() => {
			scroll = useScroll(el);
		});

		flushSync();

		(el as unknown as Record<string, number>)['scrollLeft'] = 100;
		(el as unknown as Record<string, number>)['scrollTop'] = 200;
		fireScroll(el);

		expect(scroll.x()).toBe(100);
		expect(scroll.y()).toBe(200);

		el.remove();
		cleanup();
	});

	test('isScrolling is true immediately after scroll and false after debounce', () => {
		const el = makeScrollable();
		document.body.appendChild(el);

		let scroll!: ReturnType<typeof useScroll>;

		const cleanup = $effect.root(() => {
			scroll = useScroll(el, { throttle: 150 });
		});

		flushSync();

		expect(scroll.isScrolling()).toBe(false);

		(el as unknown as Record<string, number>)['scrollTop'] = 50;
		fireScroll(el);
		expect(scroll.isScrolling()).toBe(true);

		vi.advanceTimersByTime(150);
		expect(scroll.isScrolling()).toBe(false);

		el.remove();
		cleanup();
	});

	test('arrivedState.top is true at y = 0', () => {
		const el = makeScrollable({ scrollTop: 0 });
		document.body.appendChild(el);

		let scroll!: ReturnType<typeof useScroll>;

		const cleanup = $effect.root(() => {
			scroll = useScroll(el);
		});

		flushSync();

		expect(scroll.arrivedState.top()).toBe(true);
		expect(scroll.arrivedState.bottom()).toBe(false);

		el.remove();
		cleanup();
	});

	test('arrivedState.bottom is true when scrolled to bottom', () => {
		const el = makeScrollable({
			scrollTop: 700,
			scrollHeight: 1000,
			clientHeight: 300
		});
		document.body.appendChild(el);

		let scroll!: ReturnType<typeof useScroll>;

		const cleanup = $effect.root(() => {
			scroll = useScroll(el);
		});

		flushSync();

		fireScroll(el);
		expect(scroll.arrivedState.bottom()).toBe(true);

		el.remove();
		cleanup();
	});

	test('arrivedState.left is true at x = 0', () => {
		const el = makeScrollable({ scrollLeft: 0 });
		document.body.appendChild(el);

		let scroll!: ReturnType<typeof useScroll>;

		const cleanup = $effect.root(() => {
			scroll = useScroll(el);
		});

		flushSync();

		expect(scroll.arrivedState.left()).toBe(true);

		el.remove();
		cleanup();
	});

	test('arrivedState.right is true when scrolled to right edge', () => {
		const el = makeScrollable({
			scrollLeft: 700,
			scrollWidth: 1000,
			clientWidth: 300
		});
		document.body.appendChild(el);

		let scroll!: ReturnType<typeof useScroll>;

		const cleanup = $effect.root(() => {
			scroll = useScroll(el);
		});

		flushSync();

		fireScroll(el);
		expect(scroll.arrivedState.right()).toBe(true);

		el.remove();
		cleanup();
	});

	test('directions.down is true when scrolling down', () => {
		const el = makeScrollable({ scrollTop: 0 });
		document.body.appendChild(el);

		let scroll!: ReturnType<typeof useScroll>;

		const cleanup = $effect.root(() => {
			scroll = useScroll(el);
		});

		flushSync();

		(el as unknown as Record<string, number>)['scrollTop'] = 100;
		fireScroll(el);

		expect(scroll.directions.down()).toBe(true);
		expect(scroll.directions.up()).toBe(false);

		el.remove();
		cleanup();
	});

	test('directions.up is true when scrolling up', () => {
		const el = makeScrollable({ scrollTop: 100 });
		document.body.appendChild(el);

		let scroll!: ReturnType<typeof useScroll>;

		const cleanup = $effect.root(() => {
			scroll = useScroll(el);
		});

		flushSync();

		// Scroll down first to set baseline
		(el as unknown as Record<string, number>)['scrollTop'] = 200;
		fireScroll(el);

		// Now scroll up
		(el as unknown as Record<string, number>)['scrollTop'] = 50;
		fireScroll(el);

		expect(scroll.directions.up()).toBe(true);
		expect(scroll.directions.down()).toBe(false);

		el.remove();
		cleanup();
	});

	test('directions.right is true when scrolling right', () => {
		const el = makeScrollable({ scrollLeft: 0 });
		document.body.appendChild(el);

		let scroll!: ReturnType<typeof useScroll>;

		const cleanup = $effect.root(() => {
			scroll = useScroll(el);
		});

		flushSync();

		(el as unknown as Record<string, number>)['scrollLeft'] = 50;
		fireScroll(el);

		expect(scroll.directions.right()).toBe(true);
		expect(scroll.directions.left()).toBe(false);

		el.remove();
		cleanup();
	});

	test('directions reset to false after debounce', () => {
		const el = makeScrollable({ scrollTop: 0 });
		document.body.appendChild(el);

		let scroll!: ReturnType<typeof useScroll>;

		const cleanup = $effect.root(() => {
			scroll = useScroll(el, { throttle: 100 });
		});

		flushSync();

		(el as unknown as Record<string, number>)['scrollTop'] = 100;
		fireScroll(el);
		expect(scroll.directions.down()).toBe(true);

		vi.advanceTimersByTime(100);
		expect(scroll.directions.down()).toBe(false);

		el.remove();
		cleanup();
	});

	test('scrollTo delegates to element.scrollTo', () => {
		const el = makeScrollable();
		const scrollToSpy = vi.spyOn(el, 'scrollTo');
		document.body.appendChild(el);

		let scroll!: ReturnType<typeof useScroll>;

		const cleanup = $effect.root(() => {
			scroll = useScroll(el);
		});

		flushSync();

		scroll.scrollTo({ top: 500, behavior: 'smooth' });
		expect(scrollToSpy).toHaveBeenCalledWith({ top: 500, behavior: 'smooth' });

		el.remove();
		cleanup();
	});

	test('accepts a getter function as target', () => {
		const el = makeScrollable({ scrollTop: 0 });
		document.body.appendChild(el);

		let targetEl = $state<HTMLElement | null>(el);
		let scroll!: ReturnType<typeof useScroll>;

		const cleanup = $effect.root(() => {
			scroll = useScroll(() => targetEl);
		});

		flushSync();

		(el as unknown as Record<string, number>)['scrollTop'] = 80;
		fireScroll(el);
		expect(scroll.y()).toBe(80);

		el.remove();
		cleanup();
	});

	test('removes listener on cleanup', () => {
		const el = makeScrollable();
		document.body.appendChild(el);

		let scroll!: ReturnType<typeof useScroll>;

		const cleanup = $effect.root(() => {
			scroll = useScroll(el);
		});

		flushSync();

		cleanup();

		(el as unknown as Record<string, number>)['scrollTop'] = 999;
		fireScroll(el);
		expect(scroll.y()).toBe(0);

		el.remove();
	});
});

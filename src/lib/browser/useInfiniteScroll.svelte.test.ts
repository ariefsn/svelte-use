import { flushSync } from 'svelte';
import { describe, expect, test, vi } from 'vitest';
import { useInfiniteScroll } from './useInfiniteScroll.svelte.js';

/**
 * Builds a scroll container with controllable metrics. jsdom-style layout is not computed in a
 * headless browser for detached sizes, so the three scroll properties are defined directly.
 */
function container(opts: {
	scrollTop?: number;
	scrollHeight: number;
	clientHeight: number;
	scrollLeft?: number;
	scrollWidth?: number;
	clientWidth?: number;
}): HTMLDivElement {
	const el = document.createElement('div');
	document.body.appendChild(el);
	set(el, opts);
	return el;
}

function set(el: HTMLElement, opts: Record<string, number | undefined>) {
	for (const [key, value] of Object.entries(opts)) {
		if (value === undefined) continue;
		Object.defineProperty(el, key, { value, configurable: true, writable: true });
	}
}

function scroll(el: HTMLElement) {
	el.dispatchEvent(new Event('scroll'));
}

describe('useInfiniteScroll', () => {
	test('loads immediately when the container starts at the edge', async () => {
		// A short list that does not overflow never fires a scroll event.
		const el = container({ scrollTop: 0, scrollHeight: 100, clientHeight: 100 });
		const onLoadMore = vi.fn();

		const cleanup = $effect.root(() => {
			useInfiniteScroll(() => el, onLoadMore, {
				canLoadMore: () => onLoadMore.mock.calls.length < 1
			});
			flushSync();
		});

		await vi.waitFor(() => expect(onLoadMore).toHaveBeenCalled());

		cleanup();
		el.remove();
	});

	test('does not load while the edge is out of range', () => {
		const el = container({ scrollTop: 0, scrollHeight: 1000, clientHeight: 200 });
		const onLoadMore = vi.fn();

		const cleanup = $effect.root(() => {
			useInfiniteScroll(() => el, onLoadMore);
			flushSync();
		});

		expect(onLoadMore).not.toHaveBeenCalled();

		cleanup();
		el.remove();
	});

	test('loads when scrolled to the bottom', async () => {
		const el = container({ scrollTop: 0, scrollHeight: 1000, clientHeight: 200 });
		const onLoadMore = vi.fn();
		let loaded = 0;

		const cleanup = $effect.root(() => {
			useInfiniteScroll(
				() => el,
				() => {
					loaded++;
					onLoadMore();
				},
				{ canLoadMore: () => loaded < 1 }
			);
			flushSync();

			set(el, { scrollTop: 800 });
			scroll(el);
		});

		await vi.waitFor(() => expect(onLoadMore).toHaveBeenCalled());

		cleanup();
		el.remove();
	});

	test('honours the distance threshold', async () => {
		const el = container({ scrollTop: 0, scrollHeight: 1000, clientHeight: 200 });
		const onLoadMore = vi.fn();
		let loaded = 0;

		const cleanup = $effect.root(() => {
			useInfiniteScroll(
				() => el,
				() => {
					loaded++;
					onLoadMore();
				},
				{ distance: 150, canLoadMore: () => loaded < 1 }
			);
			flushSync();

			// 1000 - 700 - 200 = 100px from the bottom, within the 150 threshold
			set(el, { scrollTop: 700 });
			scroll(el);
		});

		await vi.waitFor(() => expect(onLoadMore).toHaveBeenCalled());

		cleanup();
		el.remove();
	});

	test('respects canLoadMore', () => {
		const el = container({ scrollTop: 0, scrollHeight: 100, clientHeight: 100 });
		const onLoadMore = vi.fn();

		const cleanup = $effect.root(() => {
			useInfiniteScroll(() => el, onLoadMore, { canLoadMore: () => false });
			flushSync();
		});

		expect(onLoadMore).not.toHaveBeenCalled();

		cleanup();
		el.remove();
	});

	test('does not overlap loads', async () => {
		const el = container({ scrollTop: 0, scrollHeight: 1000, clientHeight: 200 });
		let resolveLoad: () => void = () => {};
		let started = 0;

		const cleanup = $effect.root(() => {
			useInfiniteScroll(
				() => el,
				() =>
					new Promise<void>((resolve) => {
						started++;
						resolveLoad = resolve;
					}),
				{ canLoadMore: () => started < 5 }
			);
			flushSync();

			set(el, { scrollTop: 800 });
			scroll(el);
			scroll(el);
			scroll(el);
		});

		await vi.waitFor(() => expect(started).toBe(1));
		expect(started).toBe(1);

		resolveLoad();
		cleanup();
		el.remove();
	});

	test('tracks isLoading across an async load', async () => {
		const el = container({ scrollTop: 0, scrollHeight: 100, clientHeight: 100 });
		let resolveLoad: () => void = () => {};
		let calls = 0;

		let isLoading!: () => boolean;
		const cleanup = $effect.root(() => {
			({ isLoading } = useInfiniteScroll(
				() => el,
				() =>
					new Promise<void>((resolve) => {
						calls++;
						resolveLoad = resolve;
					}),
				{ canLoadMore: () => calls < 1 }
			));
			flushSync();
		});

		await vi.waitFor(() => expect(calls).toBe(1));
		flushSync();
		expect(isLoading()).toBe(true);

		resolveLoad();
		await vi.waitFor(() => {
			flushSync();
			expect(isLoading()).toBe(false);
		});

		cleanup();
		el.remove();
	});

	test('watches the top edge when direction is "top"', async () => {
		const el = container({ scrollTop: 0, scrollHeight: 1000, clientHeight: 200 });
		const onLoadMore = vi.fn();
		let loaded = 0;

		const cleanup = $effect.root(() => {
			useInfiniteScroll(
				() => el,
				() => {
					loaded++;
					onLoadMore();
				},
				{ direction: 'top', canLoadMore: () => loaded < 1 }
			);
			flushSync();
		});

		// scrollTop is already 0, i.e. at the top edge.
		await vi.waitFor(() => expect(onLoadMore).toHaveBeenCalled());

		cleanup();
		el.remove();
	});

	test('check() triggers a load manually', async () => {
		const el = container({ scrollTop: 0, scrollHeight: 1000, clientHeight: 200 });
		const onLoadMore = vi.fn();
		let loaded = 0;

		let check!: () => void;
		const cleanup = $effect.root(() => {
			({ check } = useInfiniteScroll(
				() => el,
				() => {
					loaded++;
					onLoadMore();
				},
				{ canLoadMore: () => loaded < 1 }
			));
			flushSync();
		});

		expect(onLoadMore).not.toHaveBeenCalled();

		set(el, { scrollTop: 800 });
		check();

		await vi.waitFor(() => expect(onLoadMore).toHaveBeenCalled());

		cleanup();
		el.remove();
	});

	test('stops loading after the scope is destroyed', async () => {
		const el = container({ scrollTop: 0, scrollHeight: 1000, clientHeight: 200 });
		const onLoadMore = vi.fn();

		const cleanup = $effect.root(() => {
			useInfiniteScroll(() => el, onLoadMore);
			flushSync();
		});

		cleanup();

		set(el, { scrollTop: 800 });
		scroll(el);
		await new Promise((r) => setTimeout(r, 20));

		expect(onLoadMore).not.toHaveBeenCalled();
		el.remove();
	});
});

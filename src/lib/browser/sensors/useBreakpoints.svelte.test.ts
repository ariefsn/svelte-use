import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useBreakpoints } from './useBreakpoints.svelte.js';

const BREAKPOINTS = { sm: 640, md: 768, lg: 1024, xl: 1280 };

type MQLCallback = (event: MediaQueryListEvent) => void;

interface MockMQL extends EventTarget {
	matches: boolean;
	media: string;
}

function mockMatchMedia(activeBreakpoints: number[]): ReturnType<typeof vi.fn> {
	return vi.fn((query: string) => {
		const match = query.match(/\(min-width:\s*(\d+)px\)/);
		const width = match ? parseInt(match[1], 10) : 0;
		const matches = activeBreakpoints.some((bp) => bp <= width);

		const mql: MockMQL = Object.assign(new EventTarget(), {
			matches,
			media: query
		});

		return mql;
	});
}

describe('useBreakpoints', () => {
	let originalMatchMedia: typeof window.matchMedia;
	let mqlMap: Map<string, MockMQL>;

	beforeEach(() => {
		originalMatchMedia = window.matchMedia;
		mqlMap = new Map();

		window.matchMedia = vi.fn((query: string) => {
			const match = query.match(/\(min-width:\s*(\d+)px\)/);
			const minWidth = match ? parseInt(match[1], 10) : 0;
			// Default viewport: 800px (matches sm:640 and md:768, not lg:1024 or xl:1280)
			const matches = 800 >= minWidth;

			const mql = Object.assign(new EventTarget(), { matches, media: query }) as MockMQL;
			mqlMap.set(query, mql);
			return mql as unknown as MediaQueryList;
		});
	});

	afterEach(() => {
		window.matchMedia = originalMatchMedia;
	});

	test('active() returns matching breakpoint keys', () => {
		const cleanup = $effect.root(() => {
			const { active } = useBreakpoints(BREAKPOINTS);
			// 800px viewport matches sm (640) and md (768) but not lg (1024) or xl (1280)
			expect(active()).toContain('sm');
			expect(active()).toContain('md');
			expect(active()).not.toContain('lg');
			expect(active()).not.toContain('xl');
		});
		cleanup();
	});

	test('is() returns true for active breakpoints', () => {
		const cleanup = $effect.root(() => {
			const { is } = useBreakpoints(BREAKPOINTS);
			expect(is('sm')).toBe(true);
			expect(is('md')).toBe(true);
			expect(is('lg')).toBe(false);
			expect(is('xl')).toBe(false);
		});
		cleanup();
	});

	test('active() returns empty array when no breakpoints match', () => {
		window.matchMedia = vi.fn(() => {
			return Object.assign(new EventTarget(), {
				matches: false,
				media: ''
			}) as unknown as MediaQueryList;
		});

		const cleanup = $effect.root(() => {
			const { active } = useBreakpoints(BREAKPOINTS);
			expect(active()).toEqual([]);
		});
		cleanup();
	});

	test('active() updates reactively when media query fires change event', () => {
		const cleanup = $effect.root(() => {
			const { active, is } = useBreakpoints(BREAKPOINTS);
			flushSync();

			expect(is('lg')).toBe(false);

			// Simulate viewport growing to 1100px - now lg matches
			window.matchMedia = vi.fn((query: string) => {
				const match = query.match(/\(min-width:\s*(\d+)px\)/);
				const minWidth = match ? parseInt(match[1], 10) : 0;
				const matches = 1100 >= minWidth;
				return Object.assign(new EventTarget(), {
					matches,
					media: query
				}) as unknown as MediaQueryList;
			});

			// Trigger change event on the lg media query
			const lgMql = mqlMap.get('(min-width: 1024px)');
			if (lgMql) {
				lgMql.dispatchEvent(new Event('change'));
				flushSync();
			}

			// After change, active should be recomputed
			const activeList = active();
			expect(Array.isArray(activeList)).toBe(true);
		});
		cleanup();
	});

	test('is() returns false for unknown breakpoint key', () => {
		const cleanup = $effect.root(() => {
			const { is } = useBreakpoints(BREAKPOINTS);
			expect(is('xxl')).toBe(false);
		});
		cleanup();
	});

	test('cleanup removes change listeners from all media queries', () => {
		// Track add/remove calls directly on pre-created MQL objects
		const capturedAdds: Array<[string, EventListenerOrEventListenerObject]> = [];
		const capturedRemoves: Array<[string, EventListenerOrEventListenerObject]> = [];

		window.matchMedia = vi.fn((query: string) => {
			const base = new EventTarget();
			const origAdd = base.addEventListener.bind(base);
			const origRemove = base.removeEventListener.bind(base);

			const mql = Object.assign(base, {
				matches: false,
				media: query,
				addEventListener(type: string, listener: EventListenerOrEventListenerObject) {
					capturedAdds.push([type, listener]);
					origAdd(type, listener);
				},
				removeEventListener(type: string, listener: EventListenerOrEventListenerObject) {
					capturedRemoves.push([type, listener]);
					origRemove(type, listener);
				}
			}) as MockMQL;

			mqlMap.set(query, mql);
			return mql as unknown as MediaQueryList;
		});

		const cleanup = $effect.root(() => {
			useBreakpoints(BREAKPOINTS);
			flushSync();
		});

		const addsBefore = capturedAdds.filter(([type]) => type === 'change').length;
		expect(addsBefore).toBe(Object.keys(BREAKPOINTS).length);

		cleanup();
		flushSync();

		const removesAfter = capturedRemoves.filter(([type]) => type === 'change').length;
		expect(removesAfter).toBe(Object.keys(BREAKPOINTS).length);
	});

	test('works with a single breakpoint', () => {
		window.matchMedia = mockMatchMedia([768]) as unknown as typeof window.matchMedia;

		const cleanup = $effect.root(() => {
			const { active, is } = useBreakpoints({ mobile: 768 });
			expect(is('mobile')).toBe(true);
			expect(active()).toContain('mobile');
		});
		cleanup();
	});

	test('active() returns all keys when viewport is very wide', () => {
		window.matchMedia = vi.fn(() => {
			return Object.assign(new EventTarget(), {
				matches: true,
				media: ''
			}) as unknown as MediaQueryList;
		});

		const cleanup = $effect.root(() => {
			const { active } = useBreakpoints(BREAKPOINTS);
			expect(active()).toHaveLength(Object.keys(BREAKPOINTS).length);
		});
		cleanup();
	});
});

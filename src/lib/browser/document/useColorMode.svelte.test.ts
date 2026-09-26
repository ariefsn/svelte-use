import { flushSync } from 'svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { PREFERS_DARK_QUERY } from '../sensors/usePreferredDark.svelte.js';
import { colorModeScript, useColorMode } from './useColorMode.svelte.js';

type Listener = (event: MediaQueryListEvent) => void;

/** Queries currently reported as matching. */
const matching = new Set<string>();

class MockMediaQueryList {
	static instances: MockMediaQueryList[] = [];

	listeners = new Set<Listener>();

	addEventListener = vi.fn((_type: string, cb: Listener) => {
		this.listeners.add(cb);
	});
	removeEventListener = vi.fn((_type: string, cb: Listener) => {
		this.listeners.delete(cb);
	});

	constructor(readonly media: string) {
		MockMediaQueryList.instances.push(this);
	}

	get matches(): boolean {
		return matching.has(this.media);
	}

	emit() {
		for (const cb of this.listeners) cb({ matches: this.matches } as MediaQueryListEvent);
	}
}

function setMatching(...queries: string[]) {
	matching.clear();
	for (const query of queries) matching.add(query);
	for (const instance of MockMediaQueryList.instances) instance.emit();
}

const KEY = 'svelte-use-color-mode-test';

let originalMatchMedia: typeof window.matchMedia;
let target: HTMLElement;

beforeEach(() => {
	MockMediaQueryList.instances = [];
	matching.clear();
	localStorage.clear();
	originalMatchMedia = window.matchMedia;
	window.matchMedia = vi.fn(
		(q: string) => new MockMediaQueryList(q) as unknown as MediaQueryList
	) as typeof window.matchMedia;

	target = document.createElement('div');
	document.body.appendChild(target);
});

afterEach(() => {
	window.matchMedia = originalMatchMedia;
	target.remove();
	localStorage.clear();
});

describe('useColorMode', () => {
	test("defaults to 'auto' and resolves against the OS", () => {
		setMatching(PREFERS_DARK_QUERY);

		const cleanup = $effect.root(() => {
			const theme = useColorMode({ storageKey: KEY, target: () => target });
			flushSync();

			expect(theme.mode()).toBe('auto');
			expect(theme.resolved()).toBe('dark');
			expect(theme.isDark()).toBe(true);
			expect(theme.system()).toBe('dark');
		});
		cleanup();
	});

	test("resolves 'auto' to light when the OS prefers light", () => {
		const cleanup = $effect.root(() => {
			const theme = useColorMode({ storageKey: KEY, target: () => target });
			flushSync();

			expect(theme.resolved()).toBe('light');
			expect(theme.isDark()).toBe(false);
		});
		cleanup();
	});

	test('keeps following the OS while on auto', () => {
		// Resolution is derived rather than snapshotted, so this needs no
		// extra listener beyond the one usePreferredDark owns.
		const cleanup = $effect.root(() => {
			const theme = useColorMode({ storageKey: KEY, target: () => target });
			flushSync();
			expect(theme.resolved()).toBe('light');

			setMatching(PREFERS_DARK_QUERY);
			flushSync();
			expect(theme.resolved()).toBe('dark');

			setMatching();
			flushSync();
			expect(theme.resolved()).toBe('light');
		});
		cleanup();
	});

	test('an explicit selection ignores the OS', () => {
		setMatching(PREFERS_DARK_QUERY);

		const cleanup = $effect.root(() => {
			const theme = useColorMode({ storageKey: KEY, target: () => target });
			theme.set('light');
			flushSync();

			expect(theme.mode()).toBe('light');
			expect(theme.resolved()).toBe('light');
			// The OS preference is still reported, just not applied.
			expect(theme.system()).toBe('dark');
		});
		cleanup();
	});

	test('hard-defaults to dark when initialValue says so', () => {
		// The docs-site configuration: a light-mode OS still gets dark.
		const cleanup = $effect.root(() => {
			const theme = useColorMode({
				storageKey: KEY,
				initialValue: 'dark',
				target: () => target
			});
			flushSync();

			expect(theme.mode()).toBe('dark');
			expect(theme.resolved()).toBe('dark');
		});
		cleanup();
	});

	test('writes a class by default', () => {
		const cleanup = $effect.root(() => {
			const theme = useColorMode({ storageKey: KEY, target: () => target });
			theme.set('dark');
			flushSync();

			expect(target.classList.contains('dark')).toBe(true);
			expect(target.classList.contains('light')).toBe(false);
		});
		cleanup();
	});

	test('removes every known mode class, not just the last one written', () => {
		// A stale class may come from the pre-paint script, another tab, or a
		// user script, so tracking only our own writes would accumulate them.
		target.classList.add('light');
		target.classList.add('dark');

		const cleanup = $effect.root(() => {
			const theme = useColorMode({ storageKey: KEY, target: () => target });
			theme.set('light');
			flushSync();

			expect(target.classList.contains('light')).toBe(true);
			expect(target.classList.contains('dark')).toBe(false);
		});
		cleanup();
	});

	test('writes an attribute when asked', () => {
		const cleanup = $effect.root(() => {
			const theme = useColorMode({
				storageKey: KEY,
				attribute: 'data-theme',
				target: () => target
			});
			theme.set('dark');
			flushSync();

			expect(target.getAttribute('data-theme')).toBe('dark');
			expect(target.classList.contains('dark')).toBe(false);
		});
		cleanup();
	});

	test('honours custom modes', () => {
		const cleanup = $effect.root(() => {
			const theme = useColorMode<'sepia'>({
				storageKey: KEY,
				target: () => target,
				modes: { light: 'theme-light', dark: 'theme-dark', sepia: 'theme-sepia' }
			});
			theme.set('sepia');
			flushSync();

			expect(theme.resolved()).toBe('sepia');
			expect(target.classList.contains('theme-sepia')).toBe(true);
		});
		cleanup();
	});

	test('persists the selection as a bare value', () => {
		const cleanup = $effect.root(() => {
			const theme = useColorMode({ storageKey: KEY, target: () => target });
			theme.set('dark');
			flushSync();
		});
		cleanup();

		// Not `"dark"` — the identity codec is what lets colorModeScript read
		// the key without a JSON.parse.
		expect(localStorage.getItem(KEY)).toBe('dark');
	});

	test('restores a persisted selection', () => {
		localStorage.setItem(KEY, 'light');
		setMatching(PREFERS_DARK_QUERY);

		const cleanup = $effect.root(() => {
			const theme = useColorMode({ storageKey: KEY, target: () => target });
			flushSync();

			expect(theme.mode()).toBe('light');
			expect(theme.resolved()).toBe('light');
		});
		cleanup();
	});

	test('toggle() flips based on the resolved mode, leaving auto', () => {
		setMatching(PREFERS_DARK_QUERY);

		const cleanup = $effect.root(() => {
			const theme = useColorMode({ storageKey: KEY, target: () => target });
			flushSync();
			expect(theme.mode()).toBe('auto');
			expect(theme.resolved()).toBe('dark');

			theme.toggle();
			flushSync();

			// Auto-dark toggles to an explicit light.
			expect(theme.mode()).toBe('light');
			expect(theme.resolved()).toBe('light');
		});
		cleanup();
	});

	test('reset() returns to initialValue and clears storage', () => {
		const cleanup = $effect.root(() => {
			const theme = useColorMode({ storageKey: KEY, target: () => target });
			theme.set('dark');
			flushSync();
			expect(localStorage.getItem(KEY)).toBe('dark');

			theme.reset();
			flushSync();

			expect(theme.mode()).toBe('auto');
			expect(localStorage.getItem(KEY)).toBeNull();
		});
		cleanup();
	});

	test('storageKey: null keeps the mode in memory only', () => {
		const cleanup = $effect.root(() => {
			const theme = useColorMode({ storageKey: null, target: () => target });
			theme.set('dark');
			flushSync();

			expect(theme.mode()).toBe('dark');
			expect(localStorage.length).toBe(0);
		});
		cleanup();
	});

	test('two instances in one page stay in sync', () => {
		// The storage event does not fire in the tab that caused the write, so
		// this is the channel's job rather than useStorage's.
		const second = document.createElement('div');
		document.body.appendChild(second);

		const cleanup = $effect.root(() => {
			const a = useColorMode({ storageKey: KEY, target: () => target });
			const b = useColorMode({ storageKey: KEY, target: () => second });
			flushSync();

			a.set('dark');
			flushSync();

			expect(b.mode()).toBe('dark');
			expect(second.classList.contains('dark')).toBe(true);
		});

		cleanup();
		second.remove();
	});

	test('reset propagates to a second instance without re-persisting the key', () => {
		// Regression: publishing the reset as a plain 'auto' made every
		// subscriber write it back, re-creating the key reset had cleared.
		const second = document.createElement('div');
		document.body.appendChild(second);

		const cleanup = $effect.root(() => {
			const a = useColorMode({ storageKey: KEY, target: () => target });
			const b = useColorMode({ storageKey: KEY, target: () => second });
			flushSync();

			a.set('dark');
			flushSync();
			expect(b.mode()).toBe('dark');

			a.reset();
			flushSync();

			expect(a.mode()).toBe('auto');
			expect(b.mode()).toBe('auto');
			expect(localStorage.getItem(KEY)).toBeNull();
		});

		cleanup();
		second.remove();
	});

	test('onChanged replaces the default write but can delegate to it', () => {
		const seen: string[] = [];

		const cleanup = $effect.root(() => {
			const theme = useColorMode({
				storageKey: KEY,
				target: () => target,
				onChanged: (resolved, applyDefault) => {
					seen.push(resolved);
					applyDefault(resolved);
				}
			});
			theme.set('dark');
			flushSync();

			expect(seen).toContain('dark');
			expect(target.classList.contains('dark')).toBe(true);
		});
		cleanup();
	});

	test('does not observe the attribute it owns', () => {
		// Deliberately unlike useTextDirection: an observer here would fire on
		// this composable's own writes and two instances would mutually
		// re-trigger. External attribute edits are therefore not adopted.
		const cleanup = $effect.root(() => {
			const theme = useColorMode({ storageKey: KEY, target: () => target });
			theme.set('light');
			flushSync();

			target.classList.remove('light');
			target.classList.add('dark');
			flushSync();

			expect(theme.mode()).toBe('light');
		});
		cleanup();
	});

	test('stops applying after the scope is destroyed', () => {
		const cleanup = $effect.root(() => {
			const theme = useColorMode({ storageKey: KEY, target: () => target });
			theme.set('dark');
			flushSync();
		});

		cleanup();
		target.className = '';
		setMatching(PREFERS_DARK_QUERY);
		flushSync();

		expect(target.className).toBe('');
	});
});

describe('colorModeScript', () => {
	test('reads the storage key and applies a class', () => {
		const source = colorModeScript();

		expect(source).toContain('svelte-use-color-mode');
		expect(source).toContain('classList');
		expect(source).toContain(PREFERS_DARK_QUERY);
	});

	test('reflects a custom key, attribute and initial value', () => {
		const source = colorModeScript({
			storageKey: 'my-theme',
			attribute: 'data-theme',
			initialValue: 'dark'
		});

		expect(source).toContain('"my-theme"');
		expect(source).toContain('"data-theme"');
		expect(source).toContain('"dark"');
	});

	test('applies the stored mode when run', () => {
		localStorage.setItem('script-theme', 'dark');

		const source = colorModeScript({ storageKey: 'script-theme', attribute: 'data-theme' });
		// Executed the way app.html would run it, against the real document.
		new Function(source)();

		expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

		document.documentElement.removeAttribute('data-theme');
		localStorage.removeItem('script-theme');
	});

	test('falls back to the initial value when storage is empty', () => {
		const source = colorModeScript({
			storageKey: 'absent-theme',
			attribute: 'data-theme',
			initialValue: 'dark'
		});
		new Function(source)();

		expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

		document.documentElement.removeAttribute('data-theme');
	});

	test('survives storage being unavailable', () => {
		// Wrapped in try/catch because touching localStorage throws when
		// cookies are blocked, and a throwing head script blocks the page.
		const source = colorModeScript();
		expect(() => new Function(source)()).not.toThrow();

		document.documentElement.classList.remove('light', 'dark');
	});
});

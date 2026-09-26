import { usePreferredDark, PREFERS_DARK_QUERY } from '../sensors/usePreferredDark.svelte.js';
import { useStorage, type StorageArea } from '../storage/useStorage.svelte.js';
import { publishColorMode, subscribeColorMode } from './internal/colorModeChannel.js';

/** A concretely applicable mode — never `'auto'`. */
export type BasicColorMode = 'light' | 'dark';

/** What the user selected, including the deferred `'auto'`. */
export type ColorModeSelection<Custom extends string = never> = BasicColorMode | Custom | 'auto';

/** What is actually applied to the DOM, after `'auto'` is resolved. */
export type ResolvedColorMode<Custom extends string = never> = BasicColorMode | Custom;

/** Default storage key, shared with {@link colorModeScript}. */
const DEFAULT_STORAGE_KEY = 'svelte-use-color-mode';

/** Options for `useColorMode`. */
export interface UseColorModeOptions<Custom extends string = never> {
	/**
	 * Element receiving the mode.
	 * @default () => document.documentElement
	 */
	target?: () => HTMLElement | null | undefined;
	/**
	 * Attribute to write. The literal `'class'` toggles a class instead of
	 * calling `setAttribute`.
	 * @default 'class'
	 */
	attribute?: string;
	/**
	 * Maps each resolved mode to the attribute value or class name it writes.
	 * An empty string removes the attribute, or adds no class.
	 * @default { light: 'light', dark: 'dark' }
	 */
	modes?: Record<ResolvedColorMode<Custom>, string>;
	/**
	 * Selection used before storage is consulted, and when storage is empty.
	 * Pass `'dark'` to hard-default to dark regardless of the OS setting.
	 * @default 'auto'
	 */
	initialValue?: ColorModeSelection<Custom>;
	/**
	 * Persistence key. Pass `null` to disable persistence and keep the mode in
	 * memory for the lifetime of the scope.
	 * @default 'svelte-use-color-mode'
	 */
	storageKey?: string | null;
	/**
	 * Which Web Storage area persists the mode.
	 * @default 'local'
	 */
	storageArea?: StorageArea;
	/**
	 * Suppress CSS transitions for one frame while the mode flips, so colours
	 * swap instantly instead of cross-fading every transitioned property.
	 * @default true
	 */
	disableTransition?: boolean;
	/**
	 * Replaces the default DOM write. Receives the resolved mode and the
	 * default applier, so it can decorate rather than fully replace.
	 * @default undefined
	 */
	onChanged?: (
		resolved: ResolvedColorMode<Custom>,
		applyDefault: (mode: ResolvedColorMode<Custom>) => void
	) => void;
}

/** Return value of `useColorMode`. */
export interface UseColorModeReturn<Custom extends string = never> {
	/** The current selection, which may be `'auto'`. */
	mode: () => ColorModeSelection<Custom>;
	/** The selection with `'auto'` resolved against the OS preference. */
	resolved: () => ResolvedColorMode<Custom>;
	/** Whether the resolved mode is `'dark'`. */
	isDark: () => boolean;
	/** The OS preference, regardless of the current selection. */
	system: () => BasicColorMode;
	/** Selects a mode and persists it. */
	set: (mode: ColorModeSelection<Custom>) => void;
	/**
	 * Flips between light and dark based on what is currently *resolved*, and
	 * therefore leaves `'auto'` — toggling while auto-dark selects an explicit
	 * `'light'`.
	 */
	toggle: () => void;
	/** Returns to `initialValue` and clears the persisted selection. */
	reset: () => void;
}

/** Options for {@link colorModeScript}. All must match the composable's. */
export interface ColorModeScriptOptions {
	/** @default 'svelte-use-color-mode' */
	storageKey?: string;
	/** @default 'class' */
	attribute?: string;
	/** @default { light: 'light', dark: 'dark' } */
	modes?: Record<string, string>;
	/** @default 'auto' */
	initialValue?: string;
}

/**
 * Returns the source of a blocking script that applies the persisted colour
 * mode before first paint.
 *
 * A composable cannot do this: it runs after hydration, which is after first
 * paint, so a stored mode differing from the server-rendered one always
 * flashes. Putting this in `app.html` inside `<head>`, **above every
 * stylesheet**, is the only way to avoid it:
 *
 * ```html
 * <script>%colorModeScript%</script>
 * ```
 *
 * This is a plain function, not a composable — it touches no runes and is safe
 * to call at build time. Its defaults mirror {@link useColorMode}; pass the
 * same options to both or the script will apply the wrong attribute.
 *
 * @param options - Must match the `useColorMode` call it pairs with
 * @returns JavaScript source, ready to inline
 */
export function colorModeScript(options: ColorModeScriptOptions = {}): string {
	const {
		storageKey = DEFAULT_STORAGE_KEY,
		attribute = 'class',
		modes = { light: 'light', dark: 'dark' },
		initialValue = 'auto'
	} = options;

	// Minified by hand rather than generated: this string lands in the HTML of
	// every page, and a build step to compress it would be more machinery than
	// the few bytes are worth.
	return (
		`(function(){try{` +
		`var k=${JSON.stringify(storageKey)},a=${JSON.stringify(attribute)},` +
		`m=${JSON.stringify(modes)},s=localStorage.getItem(k)||${JSON.stringify(initialValue)};` +
		`if(s==='auto')s=matchMedia(${JSON.stringify(PREFERS_DARK_QUERY)}).matches?'dark':'light';` +
		`var v=m[s]||'',e=document.documentElement;` +
		`if(a==='class'){for(var p in m){if(m[p])e.classList.remove(m[p]);}if(v)e.classList.add(v);}` +
		`else if(v){e.setAttribute(a,v);}` +
		`}catch(_){}})()`
	);
}

/**
 * Reactive colour mode with `'auto'` resolution, persistence and cross-tab sync.
 *
 * `'auto'` follows the OS preference and keeps following it — resolution is
 * derived, not snapshotted, so a theme change while on `'auto'` propagates
 * with no extra listener. An explicit selection ignores the OS.
 *
 * SSR safe: the selection resolves to `initialValue` and nothing is written.
 * Pair with {@link colorModeScript} to apply a stored mode before first paint,
 * which a composable cannot do on its own.
 *
 * Replaces a separate `useDark`: that is `useColorMode().isDark`.
 *
 * @param options - Target, attribute, modes, persistence and transition behaviour
 * @returns Object with `mode`, `resolved`, `isDark`, `system`, `set`, `toggle`, `reset`
 *
 * @example
 * ```ts
 * const theme = useColorMode();
 * theme.toggle();
 * theme.isDark(); // → true
 * ```
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useColorMode } from '@ariefsn/svelte-use';
 *
 *   // Hard-default to dark, and write data-theme rather than a class
 *   const theme = useColorMode({ initialValue: 'dark', attribute: 'data-theme' });
 * </script>
 *
 * {#each ['auto', 'light', 'dark'] as const as option}
 *   <button class:active={theme.mode() === option} onclick={() => theme.set(option)}>
 *     {option}
 *   </button>
 * {/each}
 * ```
 */
export function useColorMode<Custom extends string = never>(
	options: UseColorModeOptions<Custom> = {}
): UseColorModeReturn<Custom> {
	const {
		attribute = 'class',
		initialValue = 'auto' as ColorModeSelection<Custom>,
		storageKey = DEFAULT_STORAGE_KEY,
		storageArea = 'local',
		disableTransition = true,
		onChanged,
		target: getTarget = () => (typeof document === 'undefined' ? null : document.documentElement)
	} = options;

	const modes =
		options.modes ??
		({ light: 'light', dark: 'dark' } as Record<ResolvedColorMode<Custom>, string>);

	const preferredDark = usePreferredDark();

	/**
	 * `useStorage` owns the selection; there is deliberately no second copy in
	 * local `$state`. Mirroring storage into state and back would be a cycle,
	 * and the write-back half would be a read-modify-write of state the read
	 * half sets.
	 *
	 * The identity codec stores a bare `dark` rather than `"dark"`, so
	 * `colorModeScript` needs no `JSON.parse`.
	 */
	const store =
		storageKey === null
			? null
			: useStorage<ColorModeSelection<Custom>>(storageKey, initialValue, storageArea, {
					serializer: (value) => value,
					deserializer: (raw) => raw as ColorModeSelection<Custom>
				});

	let fallback = $state<ColorModeSelection<Custom>>(initialValue);
	const selection = (): ColorModeSelection<Custom> => (store ? store.value : fallback);

	const system = $derived<BasicColorMode>(preferredDark() ? 'dark' : 'light');
	const resolved = $derived<ResolvedColorMode<Custom>>(
		selection() === 'auto' ? system : (selection() as ResolvedColorMode<Custom>)
	);

	function applyDefault(mode: ResolvedColorMode<Custom>) {
		const element = getTarget();
		if (!element) return;

		const value = modes[mode] ?? '';

		if (attribute === 'class') {
			// Every known mode class is removed, not just the one written last:
			// the pre-paint script, another tab, or a user script may have left
			// a different one behind, and tracking only our own writes would
			// accumulate stale classes.
			for (const candidate of Object.values(modes)) {
				if (candidate) element.classList.remove(candidate);
			}
			if (value) element.classList.add(value);
			return;
		}

		if (value) element.setAttribute(attribute, value);
		else element.removeAttribute(attribute);
	}

	/**
	 * Adds a global `transition: none` rule, forcing a reflow so it takes
	 * effect before the mode flips and again before it is removed. Without the
	 * second reflow the browser can coalesce both changes and never apply it.
	 */
	function suppressTransitions(): () => void {
		const element = getTarget();
		if (!disableTransition || typeof document === 'undefined' || !element) return () => {};

		const style = document.createElement('style');
		style.textContent = '*,*::before,*::after{transition:none !important}';
		document.head.appendChild(style);
		void getComputedStyle(element).opacity;

		return () => {
			void getComputedStyle(element).opacity;
			style.remove();
		};
	}

	function set(mode: ColorModeSelection<Custom>) {
		if (store) store.set(mode);
		else fallback = mode;
		if (storageKey !== null) publishColorMode(storageKey, mode);
	}

	$effect(() => {
		// Reads `resolved` and writes only the DOM, so there is no cycle. This
		// deliberately has no MutationObserver, unlike `useTextDirection`:
		// this composable *owns* the attribute rather than sharing it, the
		// transition-suppression path writes it too, and two instances both
		// observing and writing would mutually re-trigger. Same-page
		// agreement comes from the channel below instead.
		const mode = resolved;
		const restore = suppressTransitions();

		if (onChanged) onChanged(mode, applyDefault);
		else applyDefault(mode);

		restore();
	});

	$effect(() => {
		if (storageKey === null) return;

		return subscribeColorMode(storageKey, (mode) => {
			// Runs in a listener, outside the tracking pass, so assigning
			// reactive state here is not a self-trigger.
			if (mode === null) {
				// A reset, not a selection. Writing `initialValue` through
				// `set` would re-persist the key the reset just cleared.
				store?.remove();
				fallback = initialValue;
				return;
			}

			const next = mode as ColorModeSelection<Custom>;
			if (store) store.set(next);
			else fallback = next;
		});
	});

	return {
		mode: selection,
		resolved: () => resolved,
		isDark: () => resolved === 'dark',
		system: () => system,
		set,
		toggle: () => set(resolved === 'dark' ? 'light' : 'dark'),
		reset: () => {
			store?.remove();
			fallback = initialValue;
			if (storageKey !== null) publishColorMode(storageKey, null);
		}
	};
}

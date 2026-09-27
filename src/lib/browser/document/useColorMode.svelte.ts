import { usePreferredDark } from '../sensors/usePreferredDark.svelte.js';
import { useStorage, type StorageArea } from '../storage/useStorage.svelte.js';
import { colorModeScript, DEFAULT_COLOR_MODE_STORAGE_KEY } from './colorModeScript.js';
import { publishColorMode, subscribeColorMode } from './internal/colorModeChannel.js';

// Re-exported so `useColorMode` stays the single import site for colour mode, while the generator
// itself lives in a plain module that the pre-paint drift test can import without rune compilation.
export { colorModeScript };
export type { ColorModeScriptOptions } from './colorModeScript.js';

/** A concretely applicable mode — never `'auto'`. */
export type BasicColorMode = 'light' | 'dark';

/** What the user selected, including the deferred `'auto'`. */
export type ColorModeSelection<Custom extends string = never> = BasicColorMode | Custom | 'auto';

/** What is actually applied to the DOM, after `'auto'` is resolved. */
export type ResolvedColorMode<Custom extends string = never> = BasicColorMode | Custom;

/** Options for `useColorMode`. */
export interface UseColorModeOptions<Custom extends string = never> {
	/** Element receiving the mode. Default `() => document.documentElement`. */
	target?: () => HTMLElement | null | undefined;
	/**
	 * Attribute to write. The literal `'class'` toggles a class instead of calling `setAttribute`.
	 * Default `'class'`.
	 */
	attribute?: string;
	/**
	 * Maps each resolved mode to the attribute value or class name it writes. An empty string removes
	 * the attribute, or adds no class. Default `{ light: 'light', dark: 'dark' }`.
	 */
	modes?: Record<ResolvedColorMode<Custom>, string>;
	/**
	 * Selection used before storage is consulted, and when storage is empty. Pass `'dark'` to
	 * hard-default to dark regardless of the OS setting. Default `'auto'`.
	 */
	initialValue?: ColorModeSelection<Custom>;
	/**
	 * Persistence key. Pass `null` to disable persistence and keep the mode in memory for the
	 * lifetime of the scope. Default `'svelte-use-color-mode'`.
	 */
	storageKey?: string | null;
	/** Which Web Storage area persists the mode. Default `'local'`. */
	storageArea?: StorageArea;
	/**
	 * Suppress CSS transitions for one frame while the mode flips, so colours swap instantly instead
	 * of cross-fading every transitioned property. Default `true`.
	 */
	disableTransition?: boolean;
	/**
	 * Replaces the default DOM write. Receives the resolved mode and the default applier, so it can
	 * decorate rather than fully replace. Default `undefined`.
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
	 * Flips between light and dark based on what is currently *resolved*, and therefore leaves
	 * `'auto'` — toggling while auto-dark selects an explicit `'light'`.
	 */
	toggle: () => void;
	/** Returns to `initialValue` and clears the persisted selection. */
	reset: () => void;
}

/**
 * Reactive colour mode with `auto` resolution, persistence and cross-tab sync. `auto` follows the
 * OS preference and keeps following it, because resolution is derived rather than snapshotted.
 */
export function useColorMode<Custom extends string = never>(
	options: UseColorModeOptions<Custom> = {}
): UseColorModeReturn<Custom> {
	const {
		attribute = 'class',
		initialValue = 'auto' as ColorModeSelection<Custom>,
		storageKey = DEFAULT_COLOR_MODE_STORAGE_KEY,
		storageArea = 'local',
		disableTransition = true,
		onChanged,
		target: getTarget = () => (typeof document === 'undefined' ? null : document.documentElement)
	} = options;

	const modes =
		options.modes ??
		({ light: 'light', dark: 'dark' } as Record<ResolvedColorMode<Custom>, string>);

	const preferredDark = usePreferredDark();

	/** `useStorage` owns the selection; there is deliberately no second copy in local `$state`. */
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
			// Every known mode class is removed, not just the one written last: another tab or
			// a user script may have left a different one behind, which would accumulate.
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
	 * Adds a global `transition: none` rule, forcing a reflow so it takes effect before the mode
	 * flips and again before it is removed.
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
		// Reads `resolved`, writes only the DOM — no cycle. Deliberately no MutationObserver
		// unlike `useTextDirection`: two instances observing and writing would re-trigger.
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

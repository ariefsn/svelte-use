import { toGetter, type MaybeGetter } from '../../internal/toGetter.js';

/** Options for `useCssVar`. */
export interface UseCssVarOptions {
	/**
	 * Value reported when the property is unset, unreadable, or during SSR.
	 * @default ''
	 */
	initialValue?: string;
	/**
	 * Re-read the computed value when the target's `style` or `class`
	 * attribute changes.
	 *
	 * Off by default because each change costs a style recalculation. Even on,
	 * it is a heuristic — see the reactivity note on the docs page.
	 * @default false
	 */
	observe?: boolean;
}

/** Return value of `useCssVar`. */
export interface UseCssVarReturn {
	/** The current value, trimmed. */
	current: () => string;
	/** Writes the property inline and updates the value synchronously. */
	set: (value: string) => void;
	/** Removes the inline property, then re-reads the inherited value. */
	remove: () => void;
	/** Forces a `getComputedStyle` re-read. The escape hatch for `observe: false`. */
	refresh: () => void;
}

/**
 * Reads and writes a CSS custom property.
 *
 * Writes are authoritative and free: `set()` updates the element and the
 * reactive value in the same synchronous call, so anything changed through
 * this composable is instantly reactive.
 *
 * Reads are the compromise. Custom properties have no change event and
 * `getComputedStyle` forces a style recalculation, so this reads once at
 * initialisation and then only when asked. `observe: true` adds a
 * `MutationObserver` on `style` and `class`, which catches the common case —
 * a theme class flipping on `<html>` — but not a swapped stylesheet, a CSSOM
 * write, or an ancestor changing. `refresh()` covers the rest.
 *
 * The name must include the leading `--`. Standard properties are not
 * supported: `getPropertyValue('color')` returns a resolved colour rather than
 * failing, which would make a typo look like it worked.
 *
 * @param name - Custom property name including `--`, or a getter
 * @param target - Getter for the element. Defaults to `document.documentElement`
 * @param options - Initial value and observation behaviour
 * @returns Object with `current`, `set`, `remove` and `refresh`
 *
 * @example
 * ```ts
 * const accent = useCssVar('--accent');
 * accent.set('tomato');
 * accent.current(); // → 'tomato'
 * ```
 *
 * @example
 * ```ts
 * // Pick up a theme class flipping on <html>
 * const surface = useCssVar('--color-surface', undefined, { observe: true });
 * ```
 */
export function useCssVar(
	name: MaybeGetter<string>,
	target?: () => HTMLElement | null | undefined,
	options: UseCssVarOptions = {}
): UseCssVarReturn {
	const { initialValue = '', observe = false } = options;

	const getName = toGetter(name);
	const getTarget =
		target ?? (() => (typeof document === 'undefined' ? null : document.documentElement));

	function read(): string {
		const element = getTarget();
		if (typeof window === 'undefined' || !element) return initialValue;

		try {
			// Custom property values preserve leading whitespace, which would
			// stop the result comparing equal to whatever was written.
			const value = getComputedStyle(element).getPropertyValue(getName()).trim();
			return value === '' ? initialValue : value;
		} catch {
			return initialValue;
		}
	}

	// One recalculation per instance, at initialisation rather than in an
	// effect, so the first render already has the real value.
	let current = $state(read());

	function refresh() {
		current = read();
	}

	function set(value: string) {
		current = value;
		getTarget()?.style.setProperty(getName(), value);
	}

	function remove() {
		getTarget()?.style.removeProperty(getName());
		refresh();
	}

	$effect(() => {
		// Re-read when the property name changes; reads the name, not `current`.
		getName();
		current = read();
	});

	if (observe) {
		$effect(() => {
			const element = getTarget();
			if (typeof window === 'undefined' || !element) return;

			const observer = new MutationObserver(() => {
				// Runs in a callback, outside the tracking pass, so assigning
				// reactive state here is not a self-trigger.
				current = read();
			});

			observer.observe(element, { attributes: true, attributeFilter: ['style', 'class'] });

			return () => observer.disconnect();
		});
	}

	return {
		current: () => current,
		set,
		remove,
		refresh
	};
}

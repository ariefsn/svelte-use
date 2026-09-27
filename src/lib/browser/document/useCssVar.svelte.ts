import { toGetter, type MaybeGetter } from '../../internal/toGetter.js';

/** Options for `useCssVar`. */
export interface UseCssVarOptions {
	/** Value reported when the property is unset, unreadable, or during SSR. Default `''`. */
	initialValue?: string;
	/**
	 * Re-read the computed value when the target's `style` or `class` attribute changes. Default
	 * `false`.
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
 * Reads and writes a CSS custom property. Writes are instant; reads are deliberately not fully
 * reactive, because custom properties have no change event.
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

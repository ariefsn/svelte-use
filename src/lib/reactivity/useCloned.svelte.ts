/** Options for `useCloned`. */
export interface UseClonedOptions<T> {
	/**
	 * Stop re-cloning automatically, leaving `sync()` as the only way to refresh from the source.
	 * Default `false`.
	 */
	manual?: boolean;
	/**
	 * How to copy. Defaults to `structuredClone`, falling back to a JSON round-trip where it is
	 * unavailable.
	 */
	clone?: (source: T) => T;
}

/** Return value of `useCloned`. */
export interface UseClonedReturn<T> {
	/** The cloned value. Mutating it never touches the source. */
	cloned: () => T;
	/** Replaces the clone. */
	set: (value: T) => void;
	/** Re-clones from the source, discarding local changes. */
	sync: () => void;
	/** Whether the clone differs from the source, by structural comparison. */
	isModified: () => boolean;
}

/**
 * A deep copy of a reactive value, tracked separately. The usual job is an edit buffer: bind a form
 * to the clone and leave the original untouched until the user saves.
 */
export function useCloned<T>(
	source: () => T,
	options: UseClonedOptions<T> = {}
): UseClonedReturn<T> {
	const { manual = false, clone = defaultClone } = options;

	/*
	 * `$state` + effect, not the writable `$derived` the rule suggests: `$state` deep-proxies, so
	 * mutating a field (what `bind:value` does to an edit buffer) stays reactive. A `$derived` not.
	 */
	/* eslint-disable-next-line svelte/prefer-writable-derived -- see above */
	let cloned = $state<T>(clone(source()));

	function sync(): void {
		cloned = clone(source());
	}

	if (!manual) {
		// Re-clones whenever the source changes. Reads the source and writes the clone — two different
		// pieces of state, so this cannot self-trigger.
		$effect(() => {
			cloned = clone(source());
		});
	}

	return {
		cloned: () => cloned,
		set: (value: T) => {
			cloned = value;
		},
		sync,
		isModified: () => !isDeepEqual(cloned, source())
	};
}

/** `structuredClone` where available, JSON otherwise. */
function defaultClone<T>(source: T): T {
	const plain = $state.snapshot(source) as T;

	// Resolved at call time, not module scope, so an environment without it
	// still works and a test can stub it.
	if (typeof structuredClone === 'function') return structuredClone(plain);
	return JSON.parse(JSON.stringify(plain)) as T;
}

/** Structural equality, enough for change detection. */
function isDeepEqual<A, B>(a: A, b: B): boolean {
	if ((a as unknown) === (b as unknown)) return true;
	if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;

	if (Array.isArray(a) || Array.isArray(b)) {
		if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
		return a.every((item, index) => isDeepEqual(item, b[index]));
	}

	if (a instanceof Date || b instanceof Date) {
		return a instanceof Date && b instanceof Date && a.getTime() === b.getTime();
	}

	const left = a as Record<string, unknown>;
	const right = b as Record<string, unknown>;
	const keys = Object.keys(left);
	if (keys.length !== Object.keys(right).length) return false;

	return keys.every((key) => Object.hasOwn(right, key) && isDeepEqual(left[key], right[key]));
}

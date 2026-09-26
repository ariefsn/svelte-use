/** Options for `useCloned`. */
export interface UseClonedOptions<T> {
	/**
	 * Stop re-cloning automatically, leaving `sync()` as the only way to
	 * refresh from the source.
	 *
	 * Turn this **on** for a draft the user edits: left off, any change to the
	 * source discards their unsaved edits.
	 * @default false
	 */
	manual?: boolean;
	/**
	 * How to copy. Defaults to `structuredClone`, falling back to a JSON
	 * round-trip where it is unavailable.
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
 * A deep copy of a reactive value, tracked separately from it.
 *
 * The usual job is an edit buffer: clone a record, bind a form to the clone,
 * and leave the original untouched until the user saves. `isModified()` then
 * drives the enable state of that save button.
 *
 * Copies with `structuredClone`, which handles `Map`, `Set`, `Date`, `RegExp`,
 * typed arrays and cycles — everything a JSON round-trip quietly destroys. It
 * cannot copy functions or class behaviour; pass your own `clone` for those.
 *
 * Works on the server: `structuredClone` is available in Node 17+, and there
 * is a JSON fallback besides.
 *
 * @template T - The value being cloned
 * @param source - Getter for the value to copy
 * @param options - Sync behaviour and a custom clone function
 * @returns The clone plus `set`, `sync` and `isModified`
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useCloned } from '@ariefsn/svelte-use';
 *
 *   let { user } = $props();
 *   // `manual` so incoming updates do not wipe the user's edits
 *   const draft = useCloned(() => user, { manual: true });
 * </script>
 *
 * <!-- a get/set pair, since `bind:` cannot target a call expression -->
 * <input bind:value={() => draft.cloned().name, (v) => (draft.cloned().name = v)} />
 * <button disabled={!draft.isModified()} onclick={() => save(draft.cloned())}>
 *   Save
 * </button>
 * ```
 */
export function useCloned<T>(
	source: () => T,
	options: UseClonedOptions<T> = {}
): UseClonedReturn<T> {
	const { manual = false, clone = defaultClone } = options;

	/*
	 * Deliberately `$state` plus an effect, not the writable `$derived` that
	 * `svelte/prefer-writable-derived` suggests.
	 *
	 * `$state` **deep-proxies** its value, so mutating a field —
	 * `cloned().name = 'Grace'`, which is what `bind:value` does to an edit
	 * buffer — is reactive. A `$derived` holds an unproxied value, so the same
	 * mutation changes nothing observable: `isModified()` never recomputes and
	 * a Save button never enables. Reassignment via `set()` works either way,
	 * which is why only a mutation test catches the difference.
	 */
	/* eslint-disable-next-line svelte/prefer-writable-derived -- see above */
	let cloned = $state<T>(clone(source()));

	function sync(): void {
		cloned = clone(source());
	}

	if (!manual) {
		// Re-clones whenever the source changes. Reads the source and writes
		// the clone — two different pieces of state, so this cannot
		// self-trigger.
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

/**
 * `structuredClone` where available, JSON otherwise.
 *
 * `$state.snapshot` comes first and is **not** optional: `$state` deep-proxies
 * plain objects, and `structuredClone` throws `DataCloneError` on a Proxy — so
 * cloning a reactive object, which is the whole point of this util, would fail
 * without it. The snapshot unwraps the proxy; `structuredClone` then does the
 * real copy, which the snapshot alone does not for `Map`, `Set` or `Date`
 * (it returns those by reference).
 */
function defaultClone<T>(source: T): T {
	const plain = $state.snapshot(source) as T;

	// Resolved at call time, not module scope, so an environment without it
	// still works and a test can stub it.
	if (typeof structuredClone === 'function') return structuredClone(plain);
	return JSON.parse(JSON.stringify(plain)) as T;
}

/**
 * Structural equality, enough for change detection.
 *
 * Generic rather than `unknown`, so each branch is narrowed by TypeScript's
 * own control flow rather than needing casts.
 */
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

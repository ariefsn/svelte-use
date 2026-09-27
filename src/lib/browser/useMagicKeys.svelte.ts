/* eslint-disable svelte/prefer-svelte-reactivity --
 * `_pressedKeys` is a $state holding a plain Set replaced wholesale on every change, never
 * mutated in place, so it is already reactive. `cache` is a non-reactive memo of getters.
 */
/** Normalises a raw `KeyboardEvent.key` value to a lowercase canonical name. */
function normalizeKey(key: string): string {
	const lower = key.toLowerCase();
	switch (lower) {
		case 'control':
			return 'ctrl';
		case 'escape':
			return 'esc';
		case ' ':
			return 'space';
		case 'arrowup':
			return 'up';
		case 'arrowdown':
			return 'down';
		case 'arrowleft':
			return 'left';
		case 'arrowright':
			return 'right';
		default:
			return lower;
	}
}

/**
 * Splits a combination string such as `"ctrl+shift+k"` into its canonical key parts and returns a
 * getter function that evaluates to `true` only when every part is currently pressed.
 */
function makeComboPredicate(combo: string, pressedKeys: { value: Set<string> }): () => boolean {
	const parts = combo
		.toLowerCase()
		.split('+')
		.map((p) => p.trim())
		.filter(Boolean);
	return () => parts.every((p) => pressedKeys.value.has(p));
}

/**
 * Tracks keyboard state reactively via a `Proxy`. Access any key or combination by name to get a
 * boolean getter that is `true` while those keys are held.
 */
export function useMagicKeys(): Record<string, () => boolean> {
	const pressedRef = { value: new Set<string>() };
	let _pressedKeys = $state<Set<string>>(new Set());

	$effect(() => {
		if (typeof window === 'undefined') return;

		function onKeyDown(event: KeyboardEvent) {
			const key = normalizeKey(event.key);
			_pressedKeys = new Set(_pressedKeys).add(key);
			pressedRef.value = _pressedKeys;
		}

		function onKeyUp(event: KeyboardEvent) {
			const key = normalizeKey(event.key);
			const next = new Set(_pressedKeys);
			next.delete(key);
			_pressedKeys = next;
			pressedRef.value = next;
		}

		function onVisibilityChange() {
			if (document.visibilityState === 'hidden') {
				_pressedKeys = new Set();
				pressedRef.value = _pressedKeys;
			}
		}

		window.addEventListener('keydown', onKeyDown);
		window.addEventListener('keyup', onKeyUp);
		document.addEventListener('visibilitychange', onVisibilityChange);

		return () => {
			window.removeEventListener('keydown', onKeyDown);
			window.removeEventListener('keyup', onKeyUp);
			document.removeEventListener('visibilitychange', onVisibilityChange);
		};
	});

	const cache = new Map<string, () => boolean>();

	const proxy = new Proxy({} as Record<string, () => boolean>, {
		get(_target, prop: string) {
			if (typeof prop !== 'string') return () => false;

			if (cache.has(prop)) return cache.get(prop)!;

			const fn = () => {
				const parts = prop
					.toLowerCase()
					.split('+')
					.map((p) => p.trim())
					.filter(Boolean);
				return parts.every((p) => _pressedKeys.has(p));
			};

			void makeComboPredicate; // ensure tree-shake keeps helper

			cache.set(prop, fn);
			return fn;
		},
		has(_target, prop: string) {
			return typeof prop === 'string';
		}
	});

	return proxy;
}

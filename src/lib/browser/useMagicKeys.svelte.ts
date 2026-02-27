/**
 * Normalises a raw `KeyboardEvent.key` value to a lowercase canonical name.
 *
 * Special cases: modifier key aliases ("control" → "ctrl") and common aliases
 * like "escape" → "esc" are collapsed so callers never need to know the exact
 * browser-emitted string.
 *
 * @param key - Raw `KeyboardEvent.key` value
 * @returns Lowercase canonical key name
 */
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
 * Splits a combination string such as `"ctrl+shift+k"` into its canonical
 * key parts and returns a getter function that evaluates to `true` only when
 * every part is currently pressed.
 *
 * Single-key accessors are also returned as getter functions for a uniform
 * API surface.
 *
 * @param combo - One or more keys joined with `+`, e.g. `"ctrl+a"`
 * @param pressedKeys - Reactive `Set<string>` of currently-pressed canonical keys
 * @returns Getter that returns `true` when all combo keys are pressed
 */
function makeComboPredicate(
	combo: string,
	pressedKeys: { value: Set<string> }
): () => boolean {
	const parts = combo
		.toLowerCase()
		.split('+')
		.map((p) => p.trim())
		.filter(Boolean);
	return () => parts.every((p) => pressedKeys.value.has(p));
}

/**
 * Reactive pressed-keys tracker with combo support.
 *
 * Returns a `Proxy` whose properties are getter functions: accessing
 * `keys['a']` returns `() => boolean` that is `true` while the `a` key is
 * held, and `keys['ctrl+shift+k']` returns `() => boolean` that is `true`
 * only when all three keys are simultaneously pressed.
 *
 * Key names are case-insensitive and normalised (e.g. `"Control"` → `"ctrl"`,
 * `"Escape"` → `"esc"`, `" "` → `"space"`).
 *
 * The `keydown` / `keyup` listeners are attached to `window` and removed
 * automatically when the owning reactive scope is destroyed. All pressed keys
 * are cleared on `visibilitychange` to prevent "stuck" keys when the tab is
 * backgrounded.
 *
 * Safe to call in SSR — no listeners are registered outside the browser.
 *
 * @returns A `Proxy` object where each property key (or `+`-joined combo) is
 *   a getter function returning `true` while those keys are held
 *
 * @example
 * ```ts
 * const keys = useMagicKeys();
 *
 * $effect(() => {
 *   if (keys['ctrl+s']()) save();
 * });
 *
 * // In a template:
 * // {#if keys['shift']()}  … {/if}
 * ```
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

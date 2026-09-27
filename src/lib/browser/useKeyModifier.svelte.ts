/* eslint-disable svelte/prefer-svelte-reactivity --
 * Module-scoped bookkeeping, not reactive state — reactivity comes from each instance's own
 * `pressed` $state. A SvelteSet/Map here would share reactive state across SSR requests.
 */
/** Modifier key names supported by `useKeyModifier`. */
export type KeyModifier = 'ctrl' | 'shift' | 'alt' | 'meta';

/**
 * Maps a `KeyModifier` alias to the canonical `KeyboardEvent.key` value emitted by the browser so
 * both can be tracked.
 */
const MODIFIER_ALIASES: Record<KeyModifier, string[]> = {
	ctrl: ['control', 'ctrl'],
	shift: ['shift'],
	alt: ['alt'],
	meta: ['meta']
};

/**
 * Shared listener registry — one pair of `keydown`/`keyup` handlers on `window` is reused across
 * all `useKeyModifier` calls, avoiding duplicate global listeners.
 */
let listenerCount = 0;

/** Raw pressed-key tracking (lowercase canonical names). */
const pressedKeys = new Set<string>();

type StateCallback = (pressed: boolean) => void;
const subscribers = new Map<KeyModifier, Set<StateCallback>>();

function handleKeyDown(event: KeyboardEvent) {
	pressedKeys.add(event.key.toLowerCase());
	notifySubscribers();
}

function handleKeyUp(event: KeyboardEvent) {
	pressedKeys.delete(event.key.toLowerCase());
	notifySubscribers();
}

function notifySubscribers() {
	for (const [modifier, cbs] of subscribers) {
		const aliases = MODIFIER_ALIASES[modifier];
		const isPressed = aliases.some((a) => pressedKeys.has(a));
		for (const cb of cbs) {
			cb(isPressed);
		}
	}
}

function registerGlobal() {
	if (listenerCount === 0 && typeof window !== 'undefined') {
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
	}
	listenerCount++;
}

function unregisterGlobal() {
	listenerCount--;
	if (listenerCount === 0 && typeof window !== 'undefined') {
		window.removeEventListener('keydown', handleKeyDown);
		window.removeEventListener('keyup', handleKeyUp);
		pressedKeys.clear();
	}
}

/** Tracks whether a specific modifier key (Ctrl, Shift, Alt, Meta) is currently held. */
export function useKeyModifier(modifier: KeyModifier): () => boolean {
	let pressed = $state(false);

	$effect(() => {
		if (typeof window === 'undefined') return;

		const cb: StateCallback = (isPressed) => {
			pressed = isPressed;
		};

		if (!subscribers.has(modifier)) {
			subscribers.set(modifier, new Set());
		}
		subscribers.get(modifier)!.add(cb);

		registerGlobal();

		return () => {
			const cbs = subscribers.get(modifier);
			if (cbs) {
				cbs.delete(cb);
				if (cbs.size === 0) {
					subscribers.delete(modifier);
				}
			}
			unregisterGlobal();
		};
	});

	return () => pressed;
}

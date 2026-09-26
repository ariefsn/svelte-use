import { useEventListener } from '../useEventListener.svelte.js';
import { useSupported } from '../useSupported.svelte.js';

/**
 * Orientations accepted by `ScreenOrientation.lock()`.
 *
 * TypeScript's `lib.dom` declares `unlock()` but neither `lock()` nor this
 * union, so both are supplied here and reached through a narrow cast — the
 * same approach `useSpeechRecognition` takes.
 */
export type OrientationLockType =
	| 'any'
	| 'natural'
	| 'landscape'
	| 'portrait'
	| 'portrait-primary'
	| 'portrait-secondary'
	| 'landscape-primary'
	| 'landscape-secondary';

interface LockableScreenOrientation {
	lock?: (orientation: OrientationLockType) => Promise<void>;
}

/** Return value of `useScreenOrientation`. */
export interface UseScreenOrientationReturn {
	/** Whether the Screen Orientation API is available. */
	isSupported: () => boolean;
	/** The current orientation, e.g. `'portrait-primary'`. `null` during SSR. */
	orientation: () => OrientationType | null;
	/** Rotation from the natural orientation, in degrees. */
	angle: () => number;
	/** Whether `lock()` is available — absent on desktop Safari and Firefox. */
	isLockSupported: () => boolean;
	/**
	 * Locks the screen. Rejects unless the document is fullscreen, and is
	 * unavailable on desktop entirely.
	 */
	lock: (orientation: OrientationLockType) => Promise<void>;
	/** Releases a lock. */
	unlock: () => void;
}

/**
 * Screen orientation and rotation angle.
 *
 * `orientation()` reports the four-way value (`portrait-primary` and so on)
 * and `angle()` the rotation in degrees. Both update on the `change` event.
 *
 * Locking is much less widely available than reading: it needs the document to
 * be **fullscreen**, and desktop browsers do not implement it at all. Check
 * `isLockSupported()` before offering it, and expect `lock()` to reject with a
 * `NotSupportedError` or `SecurityError` otherwise.
 *
 * SSR: `isSupported()` is `false`, `orientation()` is `null` and `angle()` is 0.
 *
 * @returns Orientation state plus `lock` and `unlock`
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useScreenOrientation } from '@ariefsn/svelte-use';
 *
 *   const screen = useScreenOrientation();
 * </script>
 *
 * <p>{screen.orientation()} at {screen.angle()}°</p>
 * ```
 */
export function useScreenOrientation(): UseScreenOrientationReturn {
	const isSupported = useSupported(
		() => typeof screen !== 'undefined' && screen.orientation !== undefined
	);

	const isLockSupported = useSupported(
		() =>
			typeof screen !== 'undefined' &&
			typeof (screen.orientation as (ScreenOrientation & LockableScreenOrientation) | undefined)
				?.lock === 'function'
	);

	let orientation = $state<OrientationType | null>(null);
	let angle = $state(0);

	function sync(): void {
		if (!isSupported()) return;
		orientation = screen.orientation.type;
		angle = screen.orientation.angle;
	}

	async function lock(next: OrientationLockType): Promise<void> {
		if (!isLockSupported()) {
			throw new DOMException(
				'Screen orientation locking is not available in this browser.',
				'NotSupportedError'
			);
		}

		const lockable = screen.orientation as ScreenOrientation & LockableScreenOrientation;
		// Rejects with SecurityError unless the document is fullscreen; letting
		// that surface is more useful than swallowing it.
		await lockable.lock?.(next);
		sync();
	}

	function unlock(): void {
		if (!isSupported()) return;
		screen.orientation.unlock();
	}

	// `screen.orientation` is neither Window, Document nor HTMLElement, so this
	// goes through the widened `useEventListener` overload.
	useEventListener(
		() => (typeof screen === 'undefined' ? null : screen.orientation),
		'change',
		sync
	);

	$effect(() => {
		sync();
	});

	return {
		isSupported,
		orientation: () => orientation,
		angle: () => angle,
		isLockSupported,
		lock,
		unlock
	};
}

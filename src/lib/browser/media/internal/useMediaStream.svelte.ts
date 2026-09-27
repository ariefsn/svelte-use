import { untrack } from 'svelte';
import { useSupported } from '../../useSupported.svelte.js';
import { getMediaDevices, stopStream } from './mediaDevices.js';

/** How a `useMediaStream` instance acquires its stream. */
export interface UseMediaStreamConfig {
	/**
	 * Performs the acquisition — `getUserMedia(constraints)` or `getDisplayMedia(options)`. Called
	 * lazily, only in a browser, and only once per `start()`.
	 */
	request: (devices: MediaDevices) => Promise<MediaStream>;
	/** Feature probe, evaluated once via `useSupported`. */
	probe: () => boolean;
	/**
	 * A key describing the current request. When it changes while a stream is live, the stream is
	 * stopped and reacquired.
	 */
	revision?: () => string;
}

/** Return value of `useMediaStream`. */
export interface UseMediaStreamReturn {
	/** Whether this capture method exists in the current browser. */
	isSupported: () => boolean;
	/** The live stream, or `null` when nothing is being captured. */
	stream: () => MediaStream | null;
	/** Whether a stream is currently live. */
	isActive: () => boolean;
	/** The last acquisition failure — `error()?.name === 'NotAllowedError'` for a denied prompt. */
	error: () => DOMException | null;
	/** Acquires a stream, or returns the existing one. Resolves `null` on failure. */
	start: () => Promise<MediaStream | null>;
	/** Stops every track and clears the stream. */
	stop: () => void;
	/** Stops, then acquires again. */
	restart: () => Promise<MediaStream | null>;
}

/**
 * Shared engine behind `useUserMedia` and `useDisplayMedia`. Guards a single in-flight request,
 * a generation counter (a late resolve stops its own tracks), and `ended` tracking.
 * @internal
 */
export function useMediaStream(config: UseMediaStreamConfig): UseMediaStreamReturn {
	const isSupported = useSupported(config.probe);

	let stream = $state<MediaStream | null>(null);
	let error = $state<DOMException | null>(null);

	// Deliberately plain `let`, not `$state`: these coordinate async work and
	// must never participate in reactivity.
	let generation = 0;
	let pending: Promise<MediaStream | null> | null = null;

	function stop(): void {
		// Bumping the generation invalidates any request still in flight.
		generation++;
		pending = null;
		stopStream(stream);
		stream = null;
	}

	function start(): Promise<MediaStream | null> {
		const existing = untrack(() => stream);
		if (existing) return Promise.resolve(existing);
		if (pending) return pending;

		const devices = getMediaDevices();
		if (!isSupported() || !devices) return Promise.resolve(null);

		const attempt = ++generation;
		error = null;

		const request = (async () => {
			try {
				const next = await config.request(devices);

				if (attempt !== generation) {
					// stop() or restart() ran while we were awaiting. This
					// stream is orphaned, so release it rather than leak it.
					stopStream(next);
					return null;
				}

				stream = next;
				return next;
			} catch (cause) {
				if (attempt === generation) {
					error =
						cause instanceof DOMException ? cause : new DOMException(String(cause), 'UnknownError');
				}
				return null;
			} finally {
				if (attempt === generation) pending = null;
			}
		})();

		pending = request;
		return request;
	}

	function restart(): Promise<MediaStream | null> {
		stop();
		return start();
	}

	// Clear the stream when its tracks end on their own — the browser's "Stop sharing" button, or a
	// device being unplugged.
	$effect(() => {
		const current = stream;
		if (!current) return;

		const tracks = current.getTracks();

		// An arrow const rather than a hoisted `function`, so the null check
		// above narrows `current` inside it.
		const handleEnded = () => {
			if (current !== untrack(() => stream)) return;
			if (current.getTracks().every((track) => track.readyState === 'ended')) {
				stream = null;
			}
		};

		for (const track of tracks) track.addEventListener('ended', handleEnded);

		return () => {
			for (const track of tracks) track.removeEventListener('ended', handleEnded);
		};
	});

	if (config.revision) {
		const revision = config.revision;
		// Plain `let`, so the mount run records the baseline without restarting.
		let previous: string | null = null;
		let seen = false;

		$effect(() => {
			const key = revision();

			if (!seen) {
				seen = true;
				previous = key;
				return;
			}
			if (key === previous) return;
			previous = key;

			// Only reacquire something we are actually holding. `untrack` keeps
			// this effect depending on the revision alone.
			if (untrack(() => stream) !== null) void restart();
		});
	}

	// Dependency-free: a teardown registers regardless, and reading anything
	// here would re-run the effect and stop the stream it had just acquired.
	$effect(() => () => stop());

	return {
		isSupported,
		stream: () => stream,
		isActive: () => stream !== null,
		error: () => error,
		start,
		stop,
		restart
	};
}

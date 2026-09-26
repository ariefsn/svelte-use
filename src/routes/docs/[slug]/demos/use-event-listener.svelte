<script lang="ts">
	import { useEventListener } from '$lib/browser/useEventListener.svelte.js';
	let size = $state({ w: 0, h: 0 });
	let clicks = $state(0);
	// Getter form, not a bare `window` / `document`: those are evaluated during
	// SSR and throw a ReferenceError, which 500s the page in `npm run dev`.
	// A getter is only called inside the effect, which never runs on the server.
	useEventListener(
		() => window,
		'resize',
		() => {
			size = { w: window.innerWidth, h: window.innerHeight };
		}
	);
	useEventListener(
		() => document,
		'click',
		() => clicks++
	);
	if (typeof window !== 'undefined') {
		size = { w: window.innerWidth, h: window.innerHeight };
	}
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">window size</span>
		<span class="value accent">{size.w} × {size.h}</span>
	</div>
	<div class="row">
		<span class="label">document clicks</span>
		<span class="value accent">{clicks}</span>
	</div>
	<p class="hint">Tracks window resize and document click events with auto-cleanup.</p>
</div>

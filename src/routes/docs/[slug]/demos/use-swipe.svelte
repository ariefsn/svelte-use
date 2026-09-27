<script lang="ts">
	import { useSwipe } from '$lib/browser/interaction/useSwipe.svelte.js';
	let el = $state<HTMLDivElement | null>(null);
	const { isSwiping, direction, lengthX, lengthY, reset } = useSwipe(() => el, { threshold: 30 });
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">swiping</span>
		<span class="value accent">{isSwiping()}</span>
	</div>
	<div class="row">
		<span class="label">direction</span>
		<span class="value accent">{direction()}</span>
	</div>
	<div class="row">
		<span class="label">distance</span>
		<span class="value accent">x: {lengthX().toFixed(0)}, y: {lengthY().toFixed(0)}</span>
	</div>
	<div
		bind:this={el}
		class="bg-bg border-border-strong text-text-muted flex h-[120px] touch-none items-center justify-center rounded-lg border"
	>
		Swipe here (touch)
	</div>
	<div class="actions">
		<button onclick={reset}>Reset</button>
	</div>
	<p class="hint">Touch swipe detection — best tested on mobile or with touch simulation.</p>
</div>

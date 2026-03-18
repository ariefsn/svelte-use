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
	<div bind:this={el} style="height:120px;background:#111;border:1px solid #333;border-radius:8px;display:flex;align-items:center;justify-content:center;touch-action:none;color:#888">
		Swipe here (touch)
	</div>
	<div class="actions">
		<button onclick={reset}>Reset</button>
	</div>
	<p class="hint">Touch swipe detection — best tested on mobile or with touch simulation.</p>
</div>

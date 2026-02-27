<script lang="ts">
	import { useTimeout } from '$lib/time/useTimeout.svelte.js';

	let delay = $state(3000);
	let fired = $state(false);
	let fireCount = $state(0);

	const { isPending, start, stop } = useTimeout(
		() => {
			fired = true;
			fireCount++;
		},
		() => delay,
		{ immediate: false }
	);

	function arm() {
		fired = false;
		start();
	}
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">pending</span>
		<span class="value accent">{isPending()}</span>
	</div>
	<div class="row">
		<span class="label">fired</span>
		<span class="value accent">{fired}</span>
		<span class="muted">({fireCount}×)</span>
	</div>

	<div class="row">
		<span class="label">delay</span>
		<input type="range" min="500" max="5000" step="500" bind:value={delay} style="flex:1" />
		<span class="value accent">{delay}ms</span>
	</div>

	<div class="actions">
		<button onclick={arm}>start()</button>
		<button onclick={stop} disabled={!isPending()}>stop()</button>
	</div>

	<p class="hint">Fires once after the delay · changing delay while pending reschedules it</p>
</div>

<style>
	input[type='range'] {
		accent-color: #a78bfa;
	}
</style>

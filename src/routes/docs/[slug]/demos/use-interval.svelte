<script lang="ts">
	import { useInterval } from '$lib/time/useInterval.svelte.js';

	let count = $state(0);
	let delay = $state(1000);

	const { pause, resume, isActive } = useInterval(
		() => count++,
		() => delay
	);
</script>

<div class="demo-wrap">
	<div class="text-accent mb-2 text-[3.5rem] leading-none font-extrabold tabular-nums">{count}</div>

	<div class="row">
		<span class="label">active</span>
		<span class="value accent">{isActive()}</span>
	</div>

	<div class="row">
		<span class="label">delay</span>
		<input type="range" min="200" max="2000" step="100" bind:value={delay} class="flex-1" />
		<span class="value accent">{delay}ms</span>
	</div>

	<div class="actions">
		<button onclick={pause} disabled={!isActive()}>pause()</button>
		<button onclick={resume} disabled={isActive()}>resume()</button>
		<button onclick={() => (count = 0)}>reset count</button>
	</div>

	<p class="hint">Changing the delay restarts the interval immediately</p>
</div>

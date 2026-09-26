<script lang="ts">
	import { useIntervalFn } from '$lib/time/useIntervalFn.svelte.js';

	let count = $state(0);

	const { resume, pause, isActive } = useIntervalFn(() => count++, 500);
</script>

<div class="demo-wrap">
	<div class="text-accent mb-2 text-[3.5rem] leading-none font-extrabold tabular-nums">{count}</div>

	<div class="row">
		<span class="label">active</span>
		<span class="value accent">{isActive()}</span>
	</div>

	<div class="actions">
		{#if isActive()}
			<button onclick={pause}>pause()</button>
		{:else}
			<button onclick={resume}>resume()</button>
		{/if}
		<button onclick={() => (count = 0)}>reset count</button>
	</div>

	<p class="hint">Does not start automatically — call resume() · interval: 500ms</p>
</div>

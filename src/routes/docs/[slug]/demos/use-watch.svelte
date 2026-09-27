<script lang="ts">
	import { useWatch } from '$lib/reactivity/useWatch.svelte.js';
	let count = $state(0);
	let log = $state<string[]>([]);
	useWatch(
		() => count,
		(curr, prev) => {
			log = [...log.slice(-4), `${prev} → ${curr}`];
		},
		{ runOnMounted: false }
	);
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">count</span>
		<span class="value accent">{count}</span>
	</div>
	<div class="actions">
		<button onclick={() => count++}>Increment</button>
		<button onclick={() => count--}>Decrement</button>
	</div>
	<div class="bg-bg text-text-muted rounded p-2 font-mono text-[0.85rem]">
		{#each log as entry, i (i)}
			<div>{entry}</div>
		{:else}
			<div>No changes yet</div>
		{/each}
	</div>
	<p class="hint">Watches count changes and logs previous → current transitions.</p>
</div>

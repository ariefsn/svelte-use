<script lang="ts">
	import { useTimeoutPoll } from '$lib/time/useTimeoutPoll.svelte.js';

	let pollCount = $state(0);
	let lastPoll = $state('—');
	let log = $state<string[]>([]);

	const { start, stop, isActive } = useTimeoutPoll(() => {
		pollCount++;
		const t = new Date().toLocaleTimeString();
		lastPoll = t;
		log = [`#${pollCount} at ${t}`, ...log].slice(0, 5);
	}, 2000);
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">active</span>
		<span class="value accent">{isActive()}</span>
	</div>
	<div class="row">
		<span class="label">polls</span>
		<span class="value accent">{pollCount}</span>
	</div>
	<div class="row">
		<span class="label">last at</span>
		<span class="value">{lastPoll}</span>
	</div>

	<div class="actions">
		{#if isActive()}
			<button onclick={stop}>stop()</button>
		{:else}
			<button onclick={start}>start()</button>
		{/if}
		<button
			onclick={() => {
				pollCount = 0;
				log = [];
				lastPoll = '—';
			}}>reset</button
		>
	</div>

	{#if log.length > 0}
		<div class="divider"></div>
		<div class="flex flex-col gap-0.5">
			{#each log as entry, i (i)}
				<div class="text-accent bg-accent-bg rounded px-2 py-0.5 font-mono text-[0.78rem]">
					{entry}
				</div>
			{/each}
		</div>
	{/if}

	<p class="hint">Chained setTimeout — interval measured from end of each execution · 2s</p>
</div>

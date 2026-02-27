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
		<div class="log">
			{#each log as entry}
				<div class="log-entry">{entry}</div>
			{/each}
		</div>
	{/if}

	<p class="hint">Chained setTimeout — interval measured from end of each execution · 2s</p>
</div>

<style>
	.log {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.log-entry {
		font-family: monospace;
		font-size: 0.78rem;
		color: #a78bfa;
		background: #1a1630;
		padding: 0.15rem 0.5rem;
		border-radius: 4px;
	}
</style>

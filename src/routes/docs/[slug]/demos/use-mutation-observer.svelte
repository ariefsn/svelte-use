<script lang="ts">
	import { useMutationObserver } from '$lib/browser/useMutationObserver.svelte.js';

	let container: HTMLElement;
	let log = $state<string[]>([]);

	useMutationObserver(
		() => container,
		(mutations) => {
			for (const m of mutations) {
				const detail =
					m.type === 'childList'
						? `childList (+${m.addedNodes.length} -${m.removedNodes.length})`
						: `${m.type}: ${m.attributeName}`;
				log = [`[${new Date().toLocaleTimeString()}] ${detail}`, ...log].slice(0, 6);
			}
		},
		{ childList: true, attributes: true, subtree: true }
	);

	let items = $state(['Item A', 'Item B', 'Item C']);

	function addItem() {
		items = [...items, `Item ${String.fromCharCode(65 + items.length)}`];
	}
	function removeItem() {
		if (items.length > 0) items = items.slice(0, -1);
	}
</script>

<div class="demo-wrap">
	<div class="actions">
		<button onclick={addItem}>Add item</button>
		<button onclick={removeItem}>Remove item</button>
	</div>

	<div class="target-box" bind:this={container}>
		{#each items as item}<div class="item">{item}</div>{/each}
	</div>

	<div class="log-box">
		{#if log.length === 0}
			<span class="muted">No mutations yet…</span>
		{:else}
			{#each log as entry}<div class="log-entry">{entry}</div>{/each}
		{/if}
	</div>
</div>

<style>
	.target-box {
		background: #111;
		border: 1px solid #2a2a2a;
		border-radius: 8px;
		padding: 0.5rem;
		min-height: 48px;
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}
	.item {
		background: #1a1630;
		border: 1px solid #3b2d6e;
		color: #a78bfa;
		padding: 0.2rem 0.6rem;
		border-radius: 5px;
		font-size: 0.8rem;
	}
	.log-box {
		background: #0a0a0a;
		border: 1px solid #1a1a1a;
		border-radius: 8px;
		padding: 0.5rem 0.75rem;
		font-family: monospace;
		font-size: 0.75rem;
		color: #555;
		min-height: 40px;
		max-height: 100px;
		overflow-y: auto;
	}
	.log-entry {
		color: #777;
		padding: 0.1rem 0;
	}
</style>

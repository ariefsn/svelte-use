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

	<div
		class="bg-bg border-border flex min-h-12 flex-wrap gap-1.5 rounded-lg border p-2"
		bind:this={container}
	>
		{#each items as item, i (i)}<div
				class="bg-accent-bg border-accent-border text-accent rounded-[5px] border px-2.5 py-1 text-[0.8rem]"
			>
				{item}
			</div>{/each}
	</div>

	<div
		class="bg-bg-sunken border-surface text-text-faint max-h-[100px] min-h-10 overflow-y-auto rounded-lg border px-3 py-2 font-mono text-[0.75rem]"
	>
		{#if log.length === 0}
			<span class="muted">No mutations yet…</span>
		{:else}
			{#each log as entry, i (i)}<div class="text-text-muted py-[0.1rem]">{entry}</div>{/each}
		{/if}
	</div>
</div>

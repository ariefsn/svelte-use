<script lang="ts">
	import { useDropZone } from '$lib';

	let zone: HTMLDivElement | undefined = $state();
	let dropped = $state<string[]>([]);

	const { isOver } = useDropZone(
		() => zone ?? null,
		(files) => {
			dropped = files.map((f) => `${f.name} (${(f.size / 1024).toFixed(1)} KB)`);
		}
	);
</script>

<div class="demo-root">
	<div bind:this={zone} class="zone" class:over={isOver()}>
		{#if isOver()}
			Release to drop
		{:else}
			Drag & drop files here
		{/if}
	</div>

	{#if dropped.length > 0}
		<ul class="file-list">
			{#each dropped as name}
				<li>{name}</li>
			{/each}
		</ul>
		<button onclick={() => (dropped = [])}>Clear</button>
	{/if}
</div>

<style>
	.demo-root {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.zone {
		padding: 2rem 1rem;
		border: 2px dashed #444;
		border-radius: 10px;
		text-align: center;
		font-size: 0.9rem;
		color: #666;
		transition:
			border-color 0.15s,
			color 0.15s,
			background 0.15s;
		cursor: default;
		user-select: none;
	}
	.zone.over {
		border-color: #a78bfa;
		color: #a78bfa;
		background: #1a1630;
	}
	.file-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.file-list li {
		font-size: 0.85rem;
		font-family: monospace;
		color: #aaa;
	}
	button {
		background: #2a2a2a;
		color: #e8e8e8;
		border: 1px solid #3a3a3a;
		border-radius: 6px;
		padding: 0.3rem 0.65rem;
		font-size: 0.82rem;
		cursor: pointer;
		width: fit-content;
	}
	button:hover {
		background: #3a3a3a;
	}
</style>

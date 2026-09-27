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

<div class="demo-wrap">
	<div
		bind:this={zone}
		class="cursor-default rounded-[10px] border-2 border-dashed px-4 py-8 text-center text-[0.9rem] transition-colors duration-150 select-none {isOver()
			? 'border-accent text-accent bg-accent-bg'
			: 'border-text-faint text-text-muted'}"
	>
		{#if isOver()}
			Release to drop
		{:else}
			Drag & drop files here
		{/if}
	</div>

	{#if dropped.length > 0}
		<ul class="m-0 flex list-none flex-col gap-1 p-0">
			{#each dropped as name, i (i)}
				<li class="text-text-dim font-mono text-[0.85rem]">{name}</li>
			{/each}
		</ul>
		<button onclick={() => (dropped = [])}>Clear</button>
	{/if}
</div>

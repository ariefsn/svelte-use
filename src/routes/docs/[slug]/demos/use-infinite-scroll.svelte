<script lang="ts">
	import { useInfiniteScroll } from '$lib';

	const PAGE_SIZE = 8;
	const TOTAL_PAGES = 6;

	let el = $state<HTMLDivElement | null>(null);
	let items = $state<string[]>([]);
	let page = $state(0);

	const { isLoading } = useInfiniteScroll(
		() => el,
		async () => {
			// Simulated network latency
			await new Promise((r) => setTimeout(r, 400));
			const start = page * PAGE_SIZE;
			items = [...items, ...Array.from({ length: PAGE_SIZE }, (_, i) => `Item ${start + i + 1}`)];
			page++;
		},
		{ distance: 40, canLoadMore: () => page < TOTAL_PAGES }
	);
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">loaded</span>
		<span class="value accent">{items.length} items · page {page}/{TOTAL_PAGES}</span>
	</div>

	<div
		bind:this={el}
		class="bg-bg-sunken border-surface h-[200px] overflow-y-auto rounded-lg border p-1.5"
	>
		{#each items as item (item)}
			<div class="text-text-dim odd:bg-bg rounded-md px-2.5 py-[0.45rem] font-mono text-[0.85rem]">
				{item}
			</div>
		{/each}

		{#if isLoading()}
			<div class="text-accent p-2.5 text-center text-[0.8rem] italic">Loading…</div>
		{:else if page >= TOTAL_PAGES}
			<div class="text-success p-2.5 text-center text-[0.8rem] italic">
				All {items.length} items loaded
			</div>
		{/if}
	</div>

	<div class="actions">
		<button onclick={() => ((items = []), (page = 0))}>reset</button>
	</div>
	<p class="hint">
		Scroll to within 40px of the bottom to load the next page. The first page loads immediately,
		because an empty list is already at its edge.
	</p>
</div>

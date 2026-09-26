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

	<div bind:this={el} class="scroller">
		{#each items as item (item)}
			<div class="item">{item}</div>
		{/each}

		{#if isLoading()}
			<div class="status">Loading…</div>
		{:else if page >= TOTAL_PAGES}
			<div class="status done">All {items.length} items loaded</div>
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

<style>
	.scroller {
		height: 200px;
		overflow-y: auto;
		border: 1px solid #1e1e1e;
		border-radius: 8px;
		background: #0d0d0d;
		padding: 0.4rem;
	}
	.item {
		padding: 0.45rem 0.6rem;
		border-radius: 6px;
		font-size: 0.85rem;
		color: #bbb;
		font-family: monospace;
	}
	.item:nth-child(odd) {
		background: #111;
	}
	.status {
		padding: 0.6rem;
		text-align: center;
		font-size: 0.8rem;
		color: #a78bfa;
		font-style: italic;
	}
	.status.done {
		color: #4ade80;
	}
</style>

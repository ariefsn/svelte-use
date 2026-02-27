<script lang="ts">
	import { useVirtualList } from '$lib/virtual/useVirtualList.svelte.js';

	const total = 10_000;
	const data = Array.from({ length: total }, (_, i) => ({
		id: i,
		text: `Row #${i + 1} — item data ${Math.floor(Math.random() * 1000)}`
	}));

	const { list, containerProps, wrapperProps, containerRef } = useVirtualList(() => data, {
		itemHeight: 36,
		overscan: 5
	});

	// Track wrapper style reactively so Svelte re-renders when total height changes.
	let wrapperStyle = $derived(wrapperProps.style);

	// bind:this requires a mutable variable; we forward the element to the hook
	// via the containerRef callback so it can measure height immediately.
	let containerEl: HTMLElement | null = $state(null);
	$effect(() => {
		containerRef(containerEl);
	});
</script>

<div class="demo-wrap" style="gap:0.5rem">
	<p class="hint">{total.toLocaleString()} items — only ~16 DOM nodes rendered at a time.</p>

	<!--
		bind:this feeds the element to containerRef so the hook measures its
		height immediately on mount (before the first scroll event fires).
	-->
	<div
		class="vlist-container"
		style={containerProps.style}
		onscroll={containerProps.onscroll}
		bind:this={containerEl}
	>
		<div style={wrapperStyle}>
			{#each list() as item (item.index)}
				<div class="vlist-row" style={item.style}>
					<span class="row-index">#{item.data.id + 1}</span>
					<span class="row-text">{item.data.text}</span>
				</div>
			{/each}
		</div>
	</div>

	<div class="row">
		<span class="label">DOM nodes</span>
		<span class="value accent">{list().length} rendered</span>
		<span class="muted">/ {total.toLocaleString()} total</span>
	</div>
</div>

<style>
	.vlist-container {
		height: 200px;
		border: 1px solid #2a2a2a;
		border-radius: 8px;
		background: #0d0d0d;
	}
	.vlist-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0 0.75rem;
		border-bottom: 1px solid #141414;
		width: 100%;
		box-sizing: border-box;
	}
	.row-index {
		font-family: monospace;
		font-size: 0.75rem;
		color: #444;
		min-width: 50px;
		flex-shrink: 0;
	}
	.row-text {
		font-size: 0.82rem;
		color: #777;
	}
</style>

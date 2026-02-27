<script lang="ts">
	import { useResizeObserver } from '$lib/browser/useResizeObserver.svelte.js';

	let box: HTMLElement;
	let w = $state(0);
	let h = $state(0);
	let count = $state(0);

	useResizeObserver(
		() => box,
		(entry) => {
			w = Math.round(entry.contentRect.width);
			h = Math.round(entry.contentRect.height);
			count++;
		}
	);
</script>

<div class="demo-wrap">
	<p class="hint">Resize the box — the callback fires on every size change.</p>

	<div class="resize-box" bind:this={box}>
		<div class="inner">
			<span class="dim">{w} × {h}</span>
			<span class="cnt">fires: {count}</span>
		</div>
	</div>
</div>

<style>
	.resize-box {
		width: 240px;
		height: 120px;
		min-width: 80px;
		min-height: 60px;
		max-width: 100%;
		resize: both;
		overflow: auto;
		background: #111;
		border: 1px solid #2a2a2a;
		border-radius: 8px;
	}
	.inner {
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		pointer-events: none;
	}
	.dim {
		font-family: monospace;
		font-size: 1rem;
		font-weight: 600;
		color: #a78bfa;
	}
	.cnt {
		font-size: 0.75rem;
		color: #555;
	}
</style>

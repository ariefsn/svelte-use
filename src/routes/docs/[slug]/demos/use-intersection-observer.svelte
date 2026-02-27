<script lang="ts">
	import { useIntersectionObserver } from '$lib/browser/useIntersectionObserver.svelte.js';

	let target: HTMLElement;
	const { isIntersecting, entry } = useIntersectionObserver(() => target, { threshold: 0.5 });
</script>

<div class="demo-wrap" style="gap:0.75rem">
	<p class="hint">Scroll the box below — the element triggers at 50% visibility.</p>

	<div class="scroll-zone">
		<div class="spacer">↓ scroll down ↓</div>
		<div bind:this={target} class="target" class:visible={isIntersecting()}>
			{isIntersecting() ? '✓ Intersecting' : '○ Not visible'}
		</div>
		<div class="spacer">↑ scroll up ↑</div>
	</div>

	<div class="row">
		<span class="label">ratio</span>
		<span class="value accent">{((entry()?.intersectionRatio ?? 0) * 100).toFixed(0)}%</span>
	</div>
</div>

<style>
	.scroll-zone {
		height: 150px;
		overflow-y: auto;
		background: #111;
		border: 1px solid #2a2a2a;
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.spacer {
		height: 100px;
		display: flex;
		align-items: center;
		color: #444;
		font-size: 0.8rem;
	}
	.target {
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		border: 1px dashed #333;
		font-size: 0.9rem;
		color: #555;
		transition: all 0.2s;
		white-space: nowrap;
	}
	.target.visible {
		border-color: #a78bfa;
		color: #a78bfa;
		background: #1a1630;
	}
</style>

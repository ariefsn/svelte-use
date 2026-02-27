<script lang="ts">
	import { useElementSize } from '$lib/browser/useElementSize.svelte.js';

	let box: HTMLElement;
	const size = useElementSize(() => box);
</script>

<div class="demo-wrap">
	<p class="hint">Resize the box using the handle at the bottom-right corner.</p>

	<div class="resize-box" bind:this={box}>
		<span class="size-label">{size.width()} × {size.height()}</span>
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
		background: #1a1630;
		border: 1px solid #a78bfa55;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.size-label {
		font-family: monospace;
		font-size: 1.1rem;
		font-weight: 600;
		color: #a78bfa;
		pointer-events: none;
	}
</style>

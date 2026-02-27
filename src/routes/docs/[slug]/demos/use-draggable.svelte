<script lang="ts">
	import { useDraggable } from '$lib/browser/useDraggable.svelte.js';

	let el: HTMLElement;
	let containerEl: HTMLElement;

	const drag = useDraggable(() => el, {
		initialValue: { x: 60, y: 40 },
		containerBounds: () => containerEl
	});
</script>

<div class="demo-wrap" style="gap:0">
	<div class="drag-arena" bind:this={containerEl}>
		<div
			bind:this={el}
			class="drag-handle"
			class:dragging={drag.isDragging()}
			style="position:absolute; {drag.style()}"
		>
			{drag.isDragging() ? '✦' : '⊹'} drag me
		</div>
	</div>

	<div class="coords">
		<span>x: <strong>{Math.round(drag.x())}</strong></span>
		<span>y: <strong>{Math.round(drag.y())}</strong></span>
		<span class:live={drag.isDragging()}>{drag.isDragging() ? 'dragging' : 'idle'}</span>
	</div>
</div>

<style>
	.drag-arena {
		position: relative;
		height: 180px;
		background: #111;
		border: 1px solid #2a2a2a;
		border-radius: 8px;
		overflow: hidden;
	}
	.drag-handle {
		width: 90px;
		height: 36px;
		background: #1a1630;
		border: 1px solid #a78bfa66;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.8rem;
		color: #a78bfa;
		cursor: grab;
		user-select: none;
		transition:
			box-shadow 0.1s,
			border-color 0.1s;
		white-space: nowrap;
	}
	.drag-handle.dragging {
		cursor: grabbing;
		border-color: #a78bfa;
		box-shadow: 0 0 12px #a78bfa44;
	}
	.coords {
		display: flex;
		gap: 1rem;
		padding: 0.6rem 0.75rem;
		font-size: 0.82rem;
		color: #666;
		background: #0d0d0d;
		border: 1px solid #1a1a1a;
		border-top: none;
		border-radius: 0 0 8px 8px;
	}
	.coords strong {
		color: #a78bfa;
	}
	.live {
		color: #a78bfa;
	}
</style>

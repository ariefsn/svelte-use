<script lang="ts">
	import { useScroll } from '$lib/browser/useScroll.svelte.js';

	let container: HTMLElement;
	const scroll = useScroll(() => container, {
		throttle: 80,
		offset: { bottom: 20 }
	});
</script>

<div class="demo-wrap" style="gap:0.75rem">
	<div class="scroll-box" bind:this={container}>
		{#each Array.from({ length: 30 }, (_, i) => i + 1) as n}
			<div class="scroll-item">Row {n}</div>
		{/each}
	</div>

	<div class="stats">
		<div class="row">
			<span class="label">x</span><span class="value accent">{Math.round(scroll.x())}px</span>
		</div>
		<div class="row">
			<span class="label">y</span><span class="value accent">{Math.round(scroll.y())}px</span>
		</div>
		<div class="row">
			<span class="label">scrolling</span><span class="value" class:accent={scroll.isScrolling()}
				>{scroll.isScrolling()}</span
			>
		</div>
		<div class="row">
			<span class="label">direction</span>
			<span class="value accent">
				{scroll.directions.up() ? '↑' : scroll.directions.down() ? '↓' : '–'}
				{scroll.directions.left() ? '←' : scroll.directions.right() ? '→' : ''}
			</span>
		</div>
		<div class="row">
			<span class="label">arrived</span>
			<span class="value accent">
				{[
					scroll.arrivedState.top() && 'top',
					scroll.arrivedState.bottom() && 'bottom',
					scroll.arrivedState.left() && 'left',
					scroll.arrivedState.right() && 'right'
				]
					.filter(Boolean)
					.join(', ') || '–'}
			</span>
		</div>
	</div>
</div>

<style>
	.scroll-box {
		height: 160px;
		overflow-y: auto;
		background: #111;
		border: 1px solid #2a2a2a;
		border-radius: 8px;
	}
	.scroll-item {
		padding: 0.4rem 0.75rem;
		font-size: 0.85rem;
		color: #555;
		border-bottom: 1px solid #1a1a1a;
	}
	.scroll-item:last-child {
		border-bottom: none;
	}
	.stats {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
</style>

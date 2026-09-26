<script lang="ts">
	import { useScroll } from '$lib/browser/useScroll.svelte.js';

	let container: HTMLElement;
	const scroll = useScroll(() => container, {
		throttle: 80,
		offset: { bottom: 20 }
	});
</script>

<div class="demo-wrap gap-3">
	<div class="bg-bg border-border h-40 overflow-y-auto rounded-lg border" bind:this={container}>
		{#each Array.from({ length: 30 }, (_, i) => i + 1) as n (n)}
			<div
				class="text-text-faint border-border/50 border-b px-3 py-1.5 text-[0.85rem] last:border-b-0"
			>
				Row {n}
			</div>
		{/each}
	</div>

	<div class="flex flex-col gap-1">
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

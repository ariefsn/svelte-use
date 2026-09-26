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
	<div
		class="bg-bg border-border relative h-[180px] overflow-hidden rounded-lg border"
		bind:this={containerEl}
	>
		<div
			bind:this={el}
			class="bg-accent-bg text-accent flex h-9 w-[90px] items-center justify-center rounded-lg border text-[0.8rem] whitespace-nowrap transition-[box-shadow,border-color] duration-100 select-none {drag.isDragging()
				? 'border-accent shadow-[0_0_12px_var(--color-accent)] cursor-grabbing'
				: 'border-accent/40 cursor-grab'}"
			style="position:absolute; {drag.style()}"
		>
			{drag.isDragging() ? '✦' : '⊹'} drag me
		</div>
	</div>

	<div
		class="bg-bg-sunken border-surface text-text-muted flex gap-4 rounded-b-lg border border-t-0 px-3 py-2.5 text-[0.82rem]"
	>
		<span>x: <strong class="text-accent">{Math.round(drag.x())}</strong></span>
		<span>y: <strong class="text-accent">{Math.round(drag.y())}</strong></span>
		<span class={drag.isDragging() ? 'text-accent' : ''}
			>{drag.isDragging() ? 'dragging' : 'idle'}</span
		>
	</div>
</div>

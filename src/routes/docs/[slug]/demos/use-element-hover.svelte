<script lang="ts">
	import { useElementHover } from '$lib';

	let card: HTMLDivElement | undefined = $state();
	let btn: HTMLButtonElement | undefined = $state();

	const { hovering: hoverCard } = useElementHover(() => card ?? null);
	const { hovering: hoverBtn } = useElementHover(() => btn ?? null);
</script>

<div class="demo-wrap">
	<div
		bind:this={card}
		class="flex cursor-default items-center justify-between rounded-lg border p-5 text-[0.9rem] transition-colors duration-150 {hoverCard()
			? 'border-accent bg-accent-bg text-text'
			: 'border-border text-text-dim'}"
	>
		<span>Hover over this card</span>
		<span
			class="rounded-full border px-2.5 py-1 text-[0.78rem] transition-all duration-150 {hoverCard()
				? 'bg-accent-bg text-accent border-accent-border'
				: 'bg-surface-2 text-text-muted border-border-strong'}"
			>{hoverCard() ? 'Hovering' : 'Not hovering'}</span
		>
	</div>

	<div class="row">
		<button bind:this={btn} class={hoverBtn() ? 'bg-accent-bg! border-accent! text-accent!' : ''}>
			Hover over this button
		</button>
		<span class="text-accent text-[0.82rem]">{hoverBtn() ? 'Button hovered!' : ''}</span>
	</div>
</div>

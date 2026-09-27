<script lang="ts">
	import { useParallax } from '$lib/animation/useParallax.svelte.js';

	let card = $state<HTMLDivElement | null>(null);
	const { x, y } = useParallax(() => card, { speed: 0.06 });
</script>

<div class="demo-wrap">
	<div
		class="bg-bg-sunken border-border flex h-[140px] items-center justify-center rounded-lg border"
	>
		<div
			class="bg-accent-bg border-accent/40 hover:shadow-accent/15 flex h-[90px] w-[180px] items-center justify-center rounded-xl border transition-shadow duration-200 will-change-transform hover:shadow-[0_8px_32px_var(--tw-shadow-color)]"
			bind:this={card}
			style:transform="translate({x()}px, {y()}px)"
		>
			<span class="text-accent pointer-events-none text-[0.8rem]">Move cursor over me</span>
		</div>
	</div>

	<div class="row">
		<span class="label">x offset</span>
		<span class="value accent">{x().toFixed(2)}px</span>
	</div>
	<div class="row">
		<span class="label">y offset</span>
		<span class="value accent">{y().toFixed(2)}px</span>
	</div>

	<p class="hint">Offset is calculated from the centre of the card · speed = 0.06</p>
</div>

<script lang="ts">
	import { useMouseInElement } from '$lib';

	let el = $state<HTMLDivElement | null>(null);
	const m = useMouseInElement(() => el);
</script>

<div class="demo-wrap">
	<div
		bind:this={el}
		class="bg-bg-sunken relative flex h-[130px] items-center justify-center overflow-hidden rounded-[10px] border transition-colors duration-200 {m.isOutside()
			? 'border-surface'
			: 'border-border-strong'}"
	>
		{#if !m.isOutside()}
			<div
				class="pointer-events-none absolute -mt-[65px] -ml-[65px] h-[130px] w-[130px] rounded-full bg-[radial-gradient(circle,var(--color-accent)_0%,transparent_68%)] opacity-40"
				style="left: {m.elementX()}px; top: {m.elementY()}px"
			></div>
		{/if}
		<span class="text-text-muted relative text-[0.85rem]">
			{m.isOutside() ? 'pointer is outside' : 'move around'}
		</span>
	</div>

	<div class="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-x-4 gap-y-1">
		<div class="row">
			<span class="label">elementX / Y</span><span class="value accent"
				>{m.elementX().toFixed(0)}, {m.elementY().toFixed(0)}</span
			>
		</div>
		<div class="row">
			<span class="label">viewport x / y</span><span class="value accent"
				>{m.x().toFixed(0)}, {m.y().toFixed(0)}</span
			>
		</div>
		<div class="row">
			<span class="label">element size</span><span class="value accent"
				>{m.elementWidth().toFixed(0)} × {m.elementHeight().toFixed(0)}</span
			>
		</div>
		<div class="row">
			<span class="label">isOutside</span><span class="value accent">{m.isOutside()}</span>
		</div>
	</div>
	<p class="hint">
		Offsets are not clamped — move outside the box and they go negative or exceed its size. Check
		<code>isOutside()</code> rather than the numbers.
	</p>
</div>

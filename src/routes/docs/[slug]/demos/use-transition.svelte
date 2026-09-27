<script lang="ts">
	import { useTransition, cubicInOut } from '$lib/animation/useTransition.svelte.js';

	let target = $state(0);

	const displayed = useTransition(() => target, { duration: 600, easing: cubicInOut });

	const presets = [0, 25, 50, 75, 100];
</script>

<div class="demo-wrap">
	<div class="flex items-center gap-3">
		<div class="bg-surface h-3 flex-1 overflow-hidden rounded-full">
			<div class="bg-accent h-full rounded-full" style:width="{displayed()}%"></div>
		</div>
		<span class="text-accent min-w-[48px] text-right font-mono text-[0.85rem]"
			>{displayed().toFixed(1)}%</span
		>
	</div>

	<div class="row">
		<span class="label">target</span>
		<span class="value accent">{target}%</span>
	</div>

	<div class="actions">
		{#each presets as p (p)}
			<button class:active={target === p} onclick={() => (target = p)}>{p}%</button>
		{/each}
	</div>

	<p class="hint">Animates from the previous value to the new target over 600ms using cubicInOut</p>
</div>

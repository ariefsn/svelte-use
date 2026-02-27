<script lang="ts">
	import { useTransition, cubicInOut } from '$lib/animation/useTransition.svelte.js';

	let target = $state(0);

	const displayed = useTransition(() => target, { duration: 600, easing: cubicInOut });

	const presets = [0, 25, 50, 75, 100];
</script>

<div class="demo-wrap">
	<div class="meter-wrap">
		<div class="meter-bar">
			<div class="meter-fill" style:width="{displayed()}%"></div>
		</div>
		<span class="meter-val">{displayed().toFixed(1)}%</span>
	</div>

	<div class="row">
		<span class="label">target</span>
		<span class="value accent">{target}%</span>
	</div>

	<div class="actions">
		{#each presets as p}
			<button class:active={target === p} onclick={() => (target = p)}>{p}%</button>
		{/each}
	</div>

	<p class="hint">Animates from the previous value to the new target over 600ms using cubicInOut</p>
</div>

<style>
	.meter-wrap {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.meter-bar {
		flex: 1;
		height: 12px;
		background: #1e1e1e;
		border-radius: 999px;
		overflow: hidden;
	}

	.meter-fill {
		height: 100%;
		background: #a78bfa;
		border-radius: 999px;
		transition: none;
	}

	.meter-val {
		font-family: monospace;
		font-size: 0.85rem;
		color: #a78bfa;
		min-width: 48px;
		text-align: right;
	}
</style>

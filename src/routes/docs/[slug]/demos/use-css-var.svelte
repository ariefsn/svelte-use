<script lang="ts">
	import { useCssVar } from '$lib';

	let box = $state<HTMLDivElement | null>(null);

	const accent = useCssVar('--demo-accent', () => box, { initialValue: '#a78bfa' });
	const swatches = ['#a78bfa', '#4ade80', '#f87171', '#fbbf24'];
</script>

<div class="demo-wrap">
	<div class="actions">
		{#each swatches as swatch (swatch)}
			<button class:active={accent.current() === swatch} onclick={() => accent.set(swatch)}>
				{swatch}
			</button>
		{/each}
		<button onclick={() => accent.remove()}>remove</button>
		<button onclick={() => accent.refresh()}>refresh</button>
	</div>

	<div class="row">
		<span class="label">--demo-accent</span>
		<span class="value accent">{accent.current() || '(unset)'}</span>
	</div>

	<div class="swatch" bind:this={box}>
		<span>live custom property</span>
	</div>

	<p class="hint">
		Writes are instant and free. Reads are the compromise: custom properties have no change event,
		so this reads once at init and then only when asked. Pass <code>observe: true</code> to catch a
		theme class flipping, and use <code>refresh()</code> for everything else.
	</p>
</div>

<style>
	.swatch {
		--demo-accent: #a78bfa;
		display: flex;
		align-items: center;
		padding: 0.9rem;
		border-radius: 8px;
		border: 2px solid var(--demo-accent);
		color: var(--demo-accent);
		font-size: 0.85rem;
		transition: all 0.15s;
	}
</style>

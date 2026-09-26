<script lang="ts">
	import { useMouseInElement } from '$lib';

	let el = $state<HTMLDivElement | null>(null);
	const m = useMouseInElement(() => el);
</script>

<div class="demo-wrap">
	<div bind:this={el} class="stage" class:outside={m.isOutside()}>
		{#if !m.isOutside()}
			<div class="spotlight" style="left: {m.elementX()}px; top: {m.elementY()}px"></div>
		{/if}
		<span class="stage-text">
			{m.isOutside() ? 'pointer is outside' : 'move around'}
		</span>
	</div>

	<div class="grid">
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

<style>
	.stage {
		position: relative;
		overflow: hidden;
		height: 130px;
		border-radius: 10px;
		border: 1px solid #262626;
		background: #0d0d0d;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: border-color 0.2s;
	}
	.stage.outside {
		border-color: #1e1e1e;
	}
	.spotlight {
		position: absolute;
		width: 130px;
		height: 130px;
		margin: -65px 0 0 -65px;
		border-radius: 50%;
		pointer-events: none;
		background: radial-gradient(circle, rgba(167, 139, 250, 0.4), transparent 68%);
	}
	.stage-text {
		position: relative;
		font-size: 0.85rem;
		color: #777;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
		gap: 0.2rem 1rem;
	}
</style>

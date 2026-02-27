<script lang="ts">
	import { useFps } from '$lib/performance/useFps.svelte.js';

	const fps = useFps();

	const color = $derived(fps() >= 55 ? '#4ade80' : fps() >= 30 ? '#facc15' : '#f87171');
</script>

<div class="demo-wrap">
	<p class="hint">Current frame rate of the browser rendering loop.</p>

	<div class="fps-display">
		<span class="fps-num" style="color:{color}">{fps()}</span>
		<span class="fps-unit">fps</span>
	</div>

	<div class="fps-bar">
		<div
			class="fps-fill"
			style="width:{(Math.min(fps(), 60) / 60) * 100}%; background:{color}"
		></div>
	</div>

	<div class="fps-labels">
		<span>0</span><span>30</span><span>60</span>
	</div>
</div>

<style>
	.fps-display {
		display: flex;
		align-items: baseline;
		gap: 0.4rem;
		margin: 0.5rem 0;
	}
	.fps-num {
		font-size: 3.5rem;
		font-weight: 800;
		font-variant-numeric: tabular-nums;
		line-height: 1;
		transition: color 0.5s;
	}
	.fps-unit {
		font-size: 1rem;
		color: #555;
	}
	.fps-bar {
		width: 100%;
		height: 6px;
		background: #1a1a1a;
		border-radius: 999px;
		overflow: hidden;
	}
	.fps-fill {
		height: 100%;
		border-radius: 999px;
		transition:
			width 0.3s,
			background 0.5s;
	}
	.fps-labels {
		display: flex;
		justify-content: space-between;
		font-size: 0.7rem;
		color: #444;
		margin-top: 0.25rem;
	}
</style>

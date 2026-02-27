<script lang="ts">
	import { useMouse } from '$lib/browser/useMouse.svelte.js';

	const mouse = useMouse();
</script>

<div class="demo-wrap">
	<p class="hint">Move your mouse over the page — position updates in real time.</p>

	<div class="crosshair-area">
		<div class="stats">
			<div class="stat"><span class="axis">X</span><span class="val accent">{mouse.x()}</span></div>
			<div class="stat"><span class="axis">Y</span><span class="val accent">{mouse.y()}</span></div>
		</div>
		<div class="source-badge">{mouse.sourceType() ?? 'none'}</div>
	</div>
</div>

<style>
	.crosshair-area {
		background: #111;
		border: 1px solid #2a2a2a;
		border-radius: 8px;
		padding: 1.5rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.stats {
		display: flex;
		gap: 1.5rem;
	}
	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.2rem;
	}
	.axis {
		font-size: 0.7rem;
		color: #555;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}
	.val {
		font-size: 1.6rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		color: #888;
	}
	.val.accent {
		color: #a78bfa;
	}
	.source-badge {
		font-family: monospace;
		font-size: 0.8rem;
		background: #1a1630;
		color: #a78bfa;
		border: 1px solid #3b2d6e;
		padding: 0.25rem 0.65rem;
		border-radius: 999px;
	}
</style>

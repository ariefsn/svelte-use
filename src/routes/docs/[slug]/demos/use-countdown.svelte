<script lang="ts">
	import { useCountdown } from '$lib/state/useCountdown.svelte.js';

	const timer = useCountdown(30);

	const pct = $derived(Math.round((timer.count() / 30) * 100));
</script>

<div class="demo-wrap">
	<div class="big-num">{timer.count()}</div>

	<div class="progress-bar">
		<div class="progress-fill" style="width:{pct}%"></div>
	</div>

	<div class="actions">
		{#if timer.isActive()}
			<button onclick={() => timer.stop()}>Pause</button>
		{:else}
			<button onclick={() => timer.start()}>
				{timer.count() === 0 ? 'Restart' : 'Start'}
			</button>
		{/if}
		<button onclick={() => timer.reset()}>Reset</button>
	</div>
</div>

<style>
	.big-num {
		font-size: 3.5rem;
		font-weight: 800;
		font-variant-numeric: tabular-nums;
		color: #a78bfa;
		line-height: 1;
		margin-bottom: 1rem;
	}
	.progress-bar {
		width: 100%;
		height: 6px;
		background: #2a2a2a;
		border-radius: 999px;
		overflow: hidden;
		margin-bottom: 1rem;
	}
	.progress-fill {
		height: 100%;
		background: #a78bfa;
		border-radius: 999px;
		transition: width 0.9s linear;
	}
</style>

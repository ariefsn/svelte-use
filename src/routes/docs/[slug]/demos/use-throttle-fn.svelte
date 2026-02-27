<script lang="ts">
	import { useThrottleFn } from '$lib/performance/useThrottleFn.svelte.js';

	let rawCount = $state(0);
	let throttledCount = $state(0);
	let lastFired = $state<string>('—');

	const throttled = useThrottleFn(() => {
		throttledCount++;
		lastFired = new Date().toLocaleTimeString('en', {
			hour12: false,
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	}, 500);

	function trigger() {
		rawCount++;
		throttled();
	}
</script>

<div class="demo-wrap">
	<p class="hint">Click rapidly — the throttled function fires at most once per 500ms.</p>

	<button class="big-btn" onclick={trigger}>Click me fast!</button>

	<div class="stats">
		<div class="stat-card">
			<span class="stat-label">raw calls</span>
			<span class="stat-val">{rawCount}</span>
		</div>
		<div class="stat-card accent">
			<span class="stat-label">throttled fires</span>
			<span class="stat-val">{throttledCount}</span>
		</div>
	</div>

	<div class="row">
		<span class="label">last fired</span><span class="value accent">{lastFired}</span>
	</div>
</div>

<style>
	.big-btn {
		width: 100%;
		padding: 0.65rem;
		background: #1a1630;
		color: #a78bfa;
		border: 1px solid #a78bfa55;
		border-radius: 8px;
		font-size: 0.95rem;
		cursor: pointer;
		transition: all 0.15s;
	}
	.big-btn:hover {
		background: #231f45;
		border-color: #a78bfa;
	}
	.big-btn:active {
		transform: scale(0.98);
	}
	.stats {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
	}
	.stat-card {
		padding: 0.6rem 0.75rem;
		background: #111;
		border: 1px solid #222;
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}
	.stat-card.accent {
		border-color: #a78bfa44;
		background: #1a1630;
	}
	.stat-label {
		font-size: 0.7rem;
		color: #555;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.stat-val {
		font-size: 1.4rem;
		font-weight: 700;
		color: #888;
		font-variant-numeric: tabular-nums;
	}
	.stat-card.accent .stat-val {
		color: #a78bfa;
	}
</style>

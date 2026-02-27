<script lang="ts">
	import { useIdle } from '$lib/performance/useIdle.svelte.js';

	const isIdle = useIdle(3000); // 3 seconds

	let lastActive = $state(new Date());
	$effect(() => {
		if (!isIdle()) lastActive = new Date();
	});
</script>

<div class="demo-wrap">
	<p class="hint">Stop moving the mouse and pressing keys for 3 seconds.</p>

	<div class="status-card" class:idle={isIdle()}>
		<div class="pulse" class:active={!isIdle()}></div>
		<div class="status-info">
			<span class="status-label">{isIdle() ? 'User is idle' : 'User is active'}</span>
			<span class="status-sub">Last activity: {lastActive.toLocaleTimeString()}</span>
		</div>
	</div>
</div>

<style>
	.status-card {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 1.25rem;
		border-radius: 8px;
		border: 1px solid #2e2e2e;
		background: #1a1a1a;
		transition: all 0.3s;
	}
	.status-card.idle {
		border-color: #f87171;
		background: #1a1010;
	}
	.pulse {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: #333;
		flex-shrink: 0;
		transition: background 0.3s;
	}
	.pulse.active {
		background: #4ade80;
		box-shadow: 0 0 0 0 #4ade8044;
		animation: ping 1.2s infinite;
	}
	@keyframes ping {
		0% {
			box-shadow: 0 0 0 0 #4ade8044;
		}
		70% {
			box-shadow: 0 0 0 8px transparent;
		}
		100% {
			box-shadow: 0 0 0 0 transparent;
		}
	}
	.status-info {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}
	.status-label {
		font-size: 0.9rem;
		color: #aaa;
	}
	.status-card.idle .status-label {
		color: #f87171;
	}
	.status-sub {
		font-size: 0.75rem;
		color: #444;
	}
</style>

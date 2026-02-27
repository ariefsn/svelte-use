<script lang="ts">
	import { useOnline } from '$lib';

	const isOnline = useOnline();
</script>

<div class="demo-root">
	<div class="status" class:online={isOnline()} class:offline={!isOnline()}>
		<span class="dot"></span>
		<span class="label">{isOnline() ? 'Online' : 'Offline'}</span>
	</div>

	<p class="hint">
		Toggle your network connection (or use browser DevTools → Network → Offline) to see the state
		change.
	</p>
</div>

<style>
	.demo-root {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.status {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		border: 1px solid #2e2e2e;
		background: #1e1e1e;
		width: fit-content;
		transition: all 0.2s;
	}
	.status.online {
		border-color: #166534;
		background: #0f2e1f;
	}
	.status.offline {
		border-color: #7f1d1d;
		background: #2a1a1a;
	}
	.dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: #555;
		flex-shrink: 0;
		transition: background 0.2s;
	}
	.online .dot {
		background: #4ade80;
		box-shadow: 0 0 6px #4ade8088;
	}
	.offline .dot {
		background: #f87171;
	}
	.label {
		font-size: 0.9rem;
		font-weight: 600;
	}
	.online .label {
		color: #4ade80;
	}
	.offline .label {
		color: #f87171;
	}
	.hint {
		margin: 0;
		font-size: 0.82rem;
		color: #666;
		font-style: italic;
		line-height: 1.5;
	}
</style>

<script lang="ts">
	import { useNetwork } from '$lib/browser/useNetwork.svelte.js';

	const net = useNetwork();
</script>

<div class="demo-wrap">
	<p class="hint">Try toggling your network connection or enabling airplane mode.</p>

	<div class="net-card" class:offline={!net.online()}>
		<div class="net-icon">{net.online() ? '🟢' : '🔴'}</div>
		<div class="net-info">
			<span class="net-label">{net.online() ? 'Online' : 'Offline'}</span>
			<span class="net-sub"
				>{net.online() ? 'Connected to the internet' : 'No network connection detected'}</span
			>
		</div>
	</div>
</div>

<style>
	.net-card {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 1.25rem;
		border-radius: 8px;
		border: 1px solid #1a3a1a;
		background: #101a10;
		transition: all 0.3s;
	}
	.net-card.offline {
		border-color: #7f1d1d;
		background: #1a1010;
	}
	.net-icon {
		font-size: 1.2rem;
		flex-shrink: 0;
	}
	.net-info {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}
	.net-label {
		font-size: 0.95rem;
		font-weight: 600;
		color: #4ade80;
	}
	.net-card.offline .net-label {
		color: #f87171;
	}
	.net-sub {
		font-size: 0.78rem;
		color: #444;
	}
</style>

<script lang="ts">
	import { useBattery } from '$lib/browser/useBattery.svelte.js';

	const battery = useBattery();
	const pct = $derived(Math.round(battery.level() * 100));
	const color = $derived(pct > 50 ? '#4ade80' : pct > 20 ? '#facc15' : '#f87171');
</script>

<div class="demo-wrap">
	<p class="hint">Shows live battery status from the Battery Status API.</p>

	<div class="battery-card">
		<div class="battery-shell">
			<div class="battery-fill" style="width:{pct}%; background:{color}"></div>
			<div class="battery-nub"></div>
		</div>

		<div class="battery-info">
			<span class="pct" style="color:{color}">{pct}%</span>
			<span class="status">{battery.charging() ? '⚡ Charging' : '🔋 On battery'}</span>
		</div>
	</div>

	<div class="row">
		<span class="label">level</span>
		<span class="value accent">{battery.level().toFixed(2)}</span>
	</div>
	<div class="row">
		<span class="label">charging</span>
		<span class="value accent">{battery.charging()}</span>
	</div>
</div>

<style>
	.battery-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: #111;
		border: 1px solid #222;
		border-radius: 8px;
	}
	.battery-shell {
		position: relative;
		width: 80px;
		height: 36px;
		border: 2px solid #444;
		border-radius: 4px;
		display: flex;
		align-items: center;
		overflow: visible;
	}
	.battery-fill {
		height: 100%;
		border-radius: 2px;
		transition:
			width 0.5s,
			background 0.5s;
	}
	.battery-nub {
		position: absolute;
		right: -6px;
		top: 50%;
		transform: translateY(-50%);
		width: 4px;
		height: 14px;
		background: #444;
		border-radius: 0 2px 2px 0;
	}
	.battery-info {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}
	.pct {
		font-size: 1.4rem;
		font-weight: 700;
		transition: color 0.5s;
	}
	.status {
		font-size: 0.8rem;
		color: #555;
	}
</style>

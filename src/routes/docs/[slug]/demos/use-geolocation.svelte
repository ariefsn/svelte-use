<script lang="ts">
	import { useGeolocation } from '$lib/browser/useGeolocation.svelte.js';

	const geo = useGeolocation({ enableHighAccuracy: false });
</script>

<div class="demo-wrap">
	<p class="hint">Click the button — your browser will ask for location permission.</p>

	{#if geo.error()}
		<div class="geo-card error">
			<span class="geo-icon">⚠</span>
			<div class="geo-info">
				<span class="geo-label">Error</span>
				<span class="geo-sub">{geo.error()?.message}</span>
			</div>
		</div>
	{:else if geo.coords()}
		<div class="geo-card ok">
			<span class="geo-icon">📍</span>
			<div class="geo-info">
				<div class="row">
					<span class="label">lat</span><span class="value accent"
						>{geo.coords()?.latitude.toFixed(6)}</span
					>
				</div>
				<div class="row">
					<span class="label">lon</span><span class="value accent"
						>{geo.coords()?.longitude.toFixed(6)}</span
					>
				</div>
				<div class="row">
					<span class="label">accuracy</span><span class="value accent"
						>{geo.coords()?.accuracy.toFixed(0)}m</span
					>
				</div>
			</div>
		</div>
	{:else}
		<div class="geo-card idle">
			<span class="geo-icon">🌐</span>
			<div class="geo-info">
				<span class="geo-label">Waiting for permission…</span>
				<span class="geo-sub">useGeolocation starts watching automatically</span>
			</div>
		</div>
	{/if}
</div>

<style>
	.geo-card {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 1rem 1.25rem;
		border-radius: 8px;
		border: 1px solid #2a2a2a;
		background: #141414;
	}
	.geo-card.ok {
		border-color: #1a3a1a;
		background: #101a10;
	}
	.geo-card.error {
		border-color: #7f1d1d;
		background: #1a1010;
	}
	.geo-icon {
		font-size: 1.3rem;
		flex-shrink: 0;
		margin-top: 0.1rem;
	}
	.geo-info {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}
	.geo-label {
		font-size: 0.9rem;
		color: #888;
	}
	.geo-sub {
		font-size: 0.78rem;
		color: #555;
	}
</style>

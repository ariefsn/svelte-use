<script lang="ts">
	import { useDeviceOrientation } from '$lib/browser/sensors/useDeviceOrientation.svelte.js';
	const { isSupported, alpha, beta, gamma, isAbsolute } = useDeviceOrientation();
</script>
<div class="demo-wrap">
	<div class="row">
		<span class="label">supported</span>
		<span class="value accent">{isSupported()}</span>
	</div>
	{#if isSupported()}
		<div class="row">
			<span class="label">alpha (z)</span>
			<span class="value accent">{alpha()?.toFixed(1) ?? 'N/A'}°</span>
		</div>
		<div class="row">
			<span class="label">beta (x)</span>
			<span class="value accent">{beta()?.toFixed(1) ?? 'N/A'}°</span>
		</div>
		<div class="row">
			<span class="label">gamma (y)</span>
			<span class="value accent">{gamma()?.toFixed(1) ?? 'N/A'}°</span>
		</div>
		<div class="row">
			<span class="label">absolute</span>
			<span class="value accent">{isAbsolute()}</span>
		</div>
	{:else}
		<p class="hint">DeviceOrientation is not available (try on a mobile device).</p>
	{/if}
</div>

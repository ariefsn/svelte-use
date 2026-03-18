<script lang="ts">
	import { useDeviceMotion } from '$lib/browser/sensors/useDeviceMotion.svelte.js';
	const { isSupported, acceleration, rotationRate, interval } = useDeviceMotion();
</script>
<div class="demo-wrap">
	<div class="row">
		<span class="label">supported</span>
		<span class="value accent">{isSupported()}</span>
	</div>
	{#if isSupported()}
		<div class="row">
			<span class="label">acceleration x</span>
			<span class="value accent">{acceleration()?.x?.toFixed(2) ?? 'N/A'}</span>
		</div>
		<div class="row">
			<span class="label">acceleration y</span>
			<span class="value accent">{acceleration()?.y?.toFixed(2) ?? 'N/A'}</span>
		</div>
		<div class="row">
			<span class="label">acceleration z</span>
			<span class="value accent">{acceleration()?.z?.toFixed(2) ?? 'N/A'}</span>
		</div>
		<div class="row">
			<span class="label">interval</span>
			<span class="value accent">{interval()}ms</span>
		</div>
	{:else}
		<p class="hint">DeviceMotion is not available (try on a mobile device).</p>
	{/if}
</div>

<script lang="ts">
	import { useSupported } from '$lib';

	const features = [
		{ name: 'Clipboard', check: useSupported(() => 'clipboard' in navigator) },
		{ name: 'Geolocation', check: useSupported(() => 'geolocation' in navigator) },
		{ name: 'Notification', check: useSupported(() => 'Notification' in window) },
		{ name: 'Vibration', check: useSupported(() => 'vibrate' in navigator) },
		{ name: 'EyeDropper', check: useSupported(() => 'EyeDropper' in window) },
		{ name: 'WakeLock', check: useSupported(() => 'wakeLock' in navigator) },
		{ name: 'SpeechRecognition', check: useSupported(() => 'webkitSpeechRecognition' in window) }
	];
</script>

<div class="demo-wrap">
	{#each features as f (f.name)}
		<div class="row">
			<span class="label">{f.name}</span>
			<span class="value" class:yes={f.check()} class:no={!f.check()}>
				{f.check() ? 'supported' : 'unavailable'}
			</span>
		</div>
	{/each}
	<p class="hint">Evaluated once at initialisation, and always <code>false</code> during SSR.</p>
</div>

<style>
	.value.yes {
		color: #4ade80;
	}
	.value.no {
		color: #666;
	}
</style>

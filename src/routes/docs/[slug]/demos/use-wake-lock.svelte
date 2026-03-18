<script lang="ts">
	import { useWakeLock } from '$lib/browser/useWakeLock.svelte.js';
	const { isSupported, isActive, request, release } = useWakeLock();
</script>
<div class="demo-wrap">
	<div class="row">
		<span class="label">supported</span>
		<span class="value accent">{isSupported()}</span>
	</div>
	<div class="row">
		<span class="label">active</span>
		<span class="value accent">{isActive()}</span>
	</div>
	<div class="actions">
		<button onclick={request} disabled={!isSupported() || isActive()}>Keep Screen On</button>
		<button onclick={release} disabled={!isActive()}>Allow Sleep</button>
	</div>
	<p class="hint">Prevents the screen from dimming or locking.</p>
</div>

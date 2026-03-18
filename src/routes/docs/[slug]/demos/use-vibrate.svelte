<script lang="ts">
	import { useVibrate } from '$lib/browser/useVibrate.svelte.js';
	const { isSupported, vibrate, stop } = useVibrate();
</script>
<div class="demo-wrap">
	<div class="row">
		<span class="label">supported</span>
		<span class="value accent">{isSupported()}</span>
	</div>
	<div class="actions">
		<button onclick={() => vibrate(200)} disabled={!isSupported()}>Short vibrate</button>
		<button onclick={() => vibrate([200, 100, 200])} disabled={!isSupported()}>Pattern</button>
		<button onclick={stop} disabled={!isSupported()}>Stop</button>
	</div>
	<p class="hint">Vibration API — works on mobile devices only.</p>
</div>

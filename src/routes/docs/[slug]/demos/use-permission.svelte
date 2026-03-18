<script lang="ts">
	import { usePermission } from '$lib/browser/usePermission.svelte.js';
	const camera = usePermission('camera');
	const mic = usePermission('microphone');
	const geo = usePermission('geolocation');
</script>
<div class="demo-wrap">
	<div class="row">
		<span class="label">camera</span>
		<span class="value accent">{camera.state() ?? 'unknown'}</span>
	</div>
	<div class="row">
		<span class="label">microphone</span>
		<span class="value accent">{mic.state() ?? 'unknown'}</span>
	</div>
	<div class="row">
		<span class="label">geolocation</span>
		<span class="value accent">{geo.state() ?? 'unknown'}</span>
	</div>
	<p class="hint">Shows current browser permission states (granted / denied / prompt).</p>
</div>

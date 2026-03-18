<script lang="ts">
	import { useWebNotification } from '$lib/browser/useWebNotification.svelte.js';
	const { isSupported, isPermissionGranted, show, close } = useWebNotification({
		title: 'Svelte Use',
		autoRequestPermission: false
	});
</script>
<div class="demo-wrap">
	<div class="row">
		<span class="label">supported</span>
		<span class="value accent">{isSupported()}</span>
	</div>
	<div class="row">
		<span class="label">permission</span>
		<span class="value accent">{isPermissionGranted() ? 'granted' : 'not granted'}</span>
	</div>
	<div class="actions">
		<button onclick={() => show({ body: 'Hello from Svelte Use! 👋' })} disabled={!isSupported()}>Show Notification</button>
		<button onclick={close}>Close</button>
	</div>
	<p class="hint">Sends a desktop notification. Permission will be requested on first click.</p>
</div>

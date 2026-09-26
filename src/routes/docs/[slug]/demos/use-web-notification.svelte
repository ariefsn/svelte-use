<script lang="ts">
	import { useWebNotification } from '$lib/browser/useWebNotification.svelte.js';
	const { isSupported, isPermissionGranted, notification, error, show, close } = useWebNotification(
		{
			title: 'Svelte Use',
			autoRequestPermission: false
		}
	);

	let shown = $state(false);

	async function handleShow() {
		await show({ body: 'Hello from Svelte Use! 👋' });
		shown = true;
	}
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
		<button onclick={handleShow} disabled={!isSupported()}>Show Notification</button>
		<button onclick={close}>Close</button>
	</div>

	{#if shown}
		{#if error()}
			<p
				class="text-warning bg-warning-bg border-warning-border m-0 rounded-md border px-2.5 py-2 text-[0.82rem] leading-normal"
			>
				Failed: {error()?.message}
			</p>
		{:else if notification()}
			<p
				class="text-success bg-success-bg border-success-border m-0 rounded-md border px-2.5 py-2 text-[0.82rem] leading-normal"
			>
				Notification created successfully. If no banner appeared, your OS suppressed it — check
				Focus/Do&nbsp;Not&nbsp;Disturb and that your browser is enabled in the system notification
				settings.
			</p>
		{/if}
	{/if}

	<p class="hint">Sends a desktop notification. Permission will be requested on first click.</p>
</div>

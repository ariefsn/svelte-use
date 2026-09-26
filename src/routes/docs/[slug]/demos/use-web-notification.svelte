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
			<p class="diag err">Failed: {error()?.message}</p>
		{:else if notification()}
			<p class="diag ok">
				Notification created successfully. If no banner appeared, your OS suppressed it — check
				Focus/Do&nbsp;Not&nbsp;Disturb and that your browser is enabled in the system notification
				settings.
			</p>
		{/if}
	{/if}

	<p class="hint">Sends a desktop notification. Permission will be requested on first click.</p>
</div>

<style>
	.diag {
		margin: 0;
		font-size: 0.82rem;
		line-height: 1.5;
		padding: 0.5rem 0.7rem;
		border-radius: 6px;
	}
	.diag.ok {
		color: #4ade80;
		background: #0f2e1f;
		border: 1px solid #166534;
	}
	.diag.err {
		color: #fbbf24;
		background: #2a1e0f;
		border: 1px solid #92400e;
	}
</style>

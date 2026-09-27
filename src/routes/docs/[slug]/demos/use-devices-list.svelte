<script lang="ts">
	import { useDevicesList } from '$lib/browser/media/useDevicesList.svelte.js';

	const devices = useDevicesList();
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">supported</span>
		<span class="value accent">{devices.isSupported()}</span>
	</div>
	<div class="row">
		<span class="label">labels visible</span>
		<span class="value accent">{devices.permissionGranted()}</span>
	</div>
	<div class="row">
		<span class="label">devices found</span>
		<span class="value accent">{devices.devices().length}</span>
	</div>

	<div class="actions">
		<button onclick={devices.ensurePermissions} disabled={devices.permissionGranted()}>
			Reveal Names
		</button>
		<button onclick={() => devices.update()}>Refresh</button>
	</div>

	<div class="divider"></div>

	{#each [['Cameras', devices.videoInputs()], ['Microphones', devices.audioInputs()], ['Speakers', devices.audioOutputs()]] as const as [heading, list] (heading)}
		<div class="row">
			<span class="label">{heading}</span>
			<span class="value">{list.length}</span>
		</div>
		{#if list.length > 0}
			<ul class="text-text-muted m-0 mb-1 list-none pl-3 text-[0.8rem]">
				{#each list as item (item.deviceId || item.label)}
					<li>{item.label || '(name hidden until permission is granted)'}</li>
				{/each}
			</ul>
		{/if}
	{/each}

	<p class="hint">
		Device names are blank until you grant access — that is the browser's rule, not a bug. The list
		also refreshes on its own when you plug in or unplug a device.
	</p>
</div>

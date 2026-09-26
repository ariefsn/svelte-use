<script lang="ts">
	import { useGamepad } from '$lib/browser/sensors/useGamepad.svelte.js';

	const pads = useGamepad({ fpsLimit: 30 });
	const pad = $derived(pads.gamepads()[0]);
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">supported</span>
		<span class="value accent">{pads.isSupported()}</span>
	</div>
	<div class="row">
		<span class="label">connected</span>
		<span class="value accent">{pads.gamepads().length}</span>
	</div>
	<div class="row">
		<span class="label">polling</span>
		<span class="value accent">{pads.isPolling()}</span>
	</div>

	{#if pad}
		<div class="divider"></div>
		<div class="row">
			<span class="label">id</span>
			<span class="value">{pad.id}</span>
		</div>
		<div class="row">
			<span class="label">left stick</span>
			<span class="value accent">{pad.axes[0]?.toFixed(2)}, {pad.axes[1]?.toFixed(2)}</span>
		</div>
		<div class="row">
			<span class="label">pressed</span>
			<span class="value accent">
				{pad.buttons
					.map((b, i) => (b.pressed ? i : null))
					.filter((i) => i !== null)
					.join(', ') || 'none'}
			</span>
		</div>
	{/if}

	<p class="hint">
		Connect a controller and <strong>press a button</strong> — browsers hide gamepads until you interact
		with one, so an empty list before that is expected, not a fault. Polling starts only once something
		is connected.
	</p>
</div>

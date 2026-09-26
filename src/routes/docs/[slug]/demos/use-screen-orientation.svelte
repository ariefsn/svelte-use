<script lang="ts">
	import { useScreenOrientation } from '$lib/browser/sensors/useScreenOrientation.svelte.js';

	const orientation = useScreenOrientation();

	let lockError = $state<string | null>(null);

	async function tryLock() {
		lockError = null;
		try {
			await orientation.lock('landscape');
		} catch (error) {
			lockError = error instanceof Error ? error.message : String(error);
		}
	}
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">supported</span>
		<span class="value accent">{orientation.isSupported()}</span>
	</div>
	<div class="row">
		<span class="label">orientation</span>
		<span class="value accent">{orientation.orientation() ?? '—'}</span>
	</div>
	<div class="row">
		<span class="label">angle</span>
		<span class="value accent">{orientation.angle()}°</span>
	</div>
	<div class="row">
		<span class="label">lock available</span>
		<span class="value accent">{orientation.isLockSupported()}</span>
	</div>

	<div class="actions">
		<button onclick={tryLock} disabled={!orientation.isLockSupported()}>Lock Landscape</button>
		<button onclick={orientation.unlock} disabled={!orientation.isSupported()}>Unlock</button>
	</div>

	{#if lockError}
		<div class="row">
			<span class="label">lock error</span>
			<span class="value">{lockError}</span>
		</div>
	{/if}

	<p class="hint">
		Rotate a phone or resize a window to watch these change. Locking needs the document to be
		fullscreen and is unavailable on desktop entirely — the error above says which applies here.
	</p>
</div>

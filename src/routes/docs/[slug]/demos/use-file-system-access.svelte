<script lang="ts">
	import { useFileSystemAccess } from '$lib/browser/useFileSystemAccess.svelte.js';

	const fs = useFileSystemAccess({
		types: [{ description: 'Text', accept: { 'text/plain': ['.txt', '.md'] } }],
		suggestedName: 'notes.txt'
	});

	let draft = $state('');

	async function open() {
		const text = await fs.open();
		if (text !== null) draft = text;
	}
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">supported</span>
		<span class="value accent">{fs.isSupported()}</span>
	</div>
	<div class="row">
		<span class="label">open file</span>
		<span class="value accent">{fs.fileName() ?? '—'}</span>
	</div>
	{#if fs.error()}
		<div class="row">
			<span class="label">error</span>
			<span class="value">{fs.error()?.name}</span>
		</div>
	{/if}

	<div class="actions">
		<button onclick={open} disabled={!fs.isSupported() || fs.isBusy()}>Open</button>
		<button onclick={() => fs.save(draft)} disabled={!fs.isSupported() || fs.isBusy()}>Save</button>
		<button onclick={() => fs.saveAs(draft)} disabled={!fs.isSupported() || fs.isBusy()}>
			Save As
		</button>
		<button onclick={fs.close} disabled={!fs.fileHandle()}>Close</button>
	</div>

	<textarea
		bind:value={draft}
		rows="4"
		placeholder="Open a text file, edit it here, then Save."
		class="bg-surface border-border text-text w-full rounded-lg border p-2 font-mono text-[0.8rem]"
	></textarea>

	<p class="hint">
		Save writes back to the file you opened — no second picker, no download. Chromium only; Firefox
		and Safari report unsupported, where a download fallback is still needed. Dismissing a picker
		shows as <span class="value accent">AbortError</span>, which is ordinary, not a failure.
	</p>
</div>

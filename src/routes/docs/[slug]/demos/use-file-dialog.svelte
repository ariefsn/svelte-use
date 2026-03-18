<script lang="ts">
	import { useFileDialog } from '$lib/browser/useFileDialog.svelte.js';
	const { files, open, reset } = useFileDialog({ accept: 'image/*', multiple: true });
</script>
<div class="demo-wrap">
	<div class="row">
		<span class="label">files selected</span>
		<span class="value accent">{files().length}</span>
	</div>
	{#each files() as file}
		<div class="row">
			<span class="label">{file.name}</span>
			<span class="value accent">{(file.size / 1024).toFixed(1)} KB</span>
		</div>
	{/each}
	<div class="actions">
		<button onclick={open}>Select Files</button>
		<button onclick={reset}>Clear</button>
	</div>
	<p class="hint">Opens a file picker for images. Multiple selection enabled.</p>
</div>

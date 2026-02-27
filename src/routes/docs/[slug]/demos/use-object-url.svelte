<script lang="ts">
	import { useObjectUrl } from '$lib/browser/storage/useObjectUrl.svelte.js';

	let file = $state<File | undefined>(undefined);
	const objectUrl = useObjectUrl(() => file);

	function onchange(e: Event) {
		const input = e.target as HTMLInputElement;
		file = input.files?.[0] ?? undefined;
	}
</script>

<div class="demo-wrap">
	<p class="hint">
		Pick a file to generate a blob URL. The URL is automatically revoked when the file changes.
	</p>

	<input type="file" {onchange} />

	<div class="row">
		<span class="label">file</span>
		<span class="value">{file?.name ?? '—'}</span>
	</div>
	<div class="row">
		<span class="label">blob URL</span>
		<span class="value accent">
			{#if objectUrl()}
				<a href={objectUrl()} target="_blank" rel="noreferrer">{objectUrl()}</a>
			{:else}
				—
			{/if}
		</span>
	</div>
</div>

<style>
	input[type='file'] {
		color: #999;
		font-size: 0.83rem;
	}

	a {
		color: #a78bfa;
		word-break: break-all;
		font-size: 0.78rem;
	}
</style>

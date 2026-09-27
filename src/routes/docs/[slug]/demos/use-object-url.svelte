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

	<input type="file" class="text-text-dim text-[0.83rem]" {onchange} />

	<div class="row">
		<span class="label">file</span>
		<span class="value">{file?.name ?? '—'}</span>
	</div>
	<div class="row">
		<span class="label">blob URL</span>
		<span class="value accent">
			{#if objectUrl()}
				<!-- eslint-disable svelte/no-navigation-without-resolve -- blob: URL from createObjectURL, not an app route -->
				<a
					href={objectUrl()}
					target="_blank"
					rel="noreferrer"
					class="text-accent text-[0.78rem] break-all">{objectUrl()}</a
				>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			{:else}
				—
			{/if}
		</span>
	</div>
</div>

<script lang="ts">
	import { useImage } from '$lib/browser/useImage.svelte.js';

	const SOURCES = [
		{ label: 'logo', src: '/logo.svg' },
		{ label: 'missing', src: '/does-not-exist.png' }
	];

	let choice = $state(0);

	const picture = useImage(() => ({ src: SOURCES[choice].src, alt: SOURCES[choice].label }));
</script>

<div class="demo-wrap">
	<div class="actions">
		{#each SOURCES as source, index (source.src)}
			<button class:active={choice === index} onclick={() => (choice = index)}>
				{source.label}
			</button>
		{/each}
		<button onclick={picture.refresh}>Reload</button>
	</div>

	<div class="row">
		<span class="label">loading</span>
		<span class="value accent">{picture.isLoading()}</span>
	</div>
	<div class="row">
		<span class="label">ready</span>
		<span class="value accent">{picture.isReady()}</span>
	</div>
	{#if picture.error()}
		<div class="row">
			<span class="label">error</span>
			<span class="value">{picture.error()?.message}</span>
		</div>
	{/if}

	{#if picture.isLoading()}
		<div class="bg-surface h-20 w-20 animate-pulse rounded-lg"></div>
	{:else if picture.isReady()}
		<img src={picture.image()?.src} alt="Preloaded" class="h-20 w-20 rounded-lg" />
	{/if}

	<p class="hint">
		The image is fetched on a detached element first, so the tag above renders from cache with no
		layout jump. Switching to the missing source shows the error — the browser exposes no status
		code for a failed image, so the URL is all there is to report.
	</p>
</div>

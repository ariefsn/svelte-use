<!--
@component
Renders SEO metadata into `<svelte:head>`. Render this **once**, in your root layout, fed by
merged data — Svelte does not deduplicate meta tags, so a second instance emits duplicates.
-->
<script lang="ts">
	import { useSeo } from './useSeo.svelte.js';
	import type { SeoData } from './types.js';

	let { data }: { data: SeoData } = $props();

	const seo = useSeo(() => data);
</script>

<svelte:head>
	<!--
		Guarded so that with no title anywhere, no element is rendered and
		whatever title already exists survives untouched.
	-->
	{#if seo.title()}<title>{seo.title()}</title>{/if}

	{#each seo.tags() as tag (tag.key)}
		{#if tag.rel}
			<link rel={tag.rel} href={tag.content} />
		{:else if tag.property}
			<meta property={tag.property} content={tag.content} />
		{:else}
			<meta name={tag.name} content={tag.content} />
		{/if}
	{/each}
</svelte:head>

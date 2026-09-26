<!--
@component
Renders SEO metadata into `<svelte:head>`, so it lands in the server-rendered
HTML where crawlers and link unfurlers can actually see it.

Render this **once**, in your root layout, fed by merged data. Svelte
concatenates `<svelte:head>` blocks from every component and does **not**
deduplicate meta tags, so rendering it again on a page would emit two
`<meta name="description">` — and crawlers take the first, which is the layout
default. That is the exact opposite of overriding, so merge the data and render
once instead.

The `<title>` here is a real element whose text is reactive after hydration, so
it updates on client-side navigation without anyone assigning `document.title`.
`useTitle` writes `document.title` directly, which mutates this same element's
text; last write wins, and this re-asserts whenever its data changes.

@example
```svelte
<script lang="ts">
  import { Seo, useSeo } from '@ariefsn/svelte-use';
  import { page } from '$app/state';

  const seo = useSeo(defaults, () => page.data.seo);
</script>

<Seo data={seo.data()} />
```
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

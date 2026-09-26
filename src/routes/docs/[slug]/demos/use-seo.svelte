<script lang="ts">
	import { useSeo, type SeoData } from '$lib';

	// Stands in for a root layout's defaults.
	const defaults: SeoData = {
		titleTemplate: '%s — Svelte Use',
		baseUrl: 'https://svelte-use.ariefsn.dev',
		description: 'Svelte 5 runes-first utility composables.',
		og: { siteName: 'Svelte Use', image: '/logo.svg', type: 'website' },
		twitter: { card: 'summary' }
	};

	// Stands in for a page's `page.data.seo` override.
	let title = $state('useSeo');
	let ogType = $state('article');

	const seo = useSeo(defaults, () => ({
		title: title || undefined,
		og: { type: ogType || undefined },
		canonical: '/docs/use-seo'
	}));
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">page title</span>
		<input type="text" bind:value={title} placeholder="(none)" />
	</div>
	<div class="row">
		<span class="label">og:type</span>
		<input type="text" bind:value={ogType} placeholder="(none)" />
	</div>

	<div class="divider"></div>

	<div class="row">
		<span class="label">resolved title</span>
		<span class="value accent">{seo.title() ?? '(none — template is skipped)'}</span>
	</div>

	<table class="w-full border-collapse text-[0.78rem]">
		<tbody>
			{#each seo.tags() as tag (tag.key)}
				<tr class="border-border border-b">
					<td class="py-1 pr-3 align-top">
						<code class="inline-code">{tag.rel ? 'link' : tag.property ? 'property' : 'name'}</code>
					</td>
					<td class="py-1 pr-3 align-top">
						<code class="inline-code">{tag.rel ?? tag.property ?? tag.name}</code>
					</td>
					<td class="text-text-muted py-1 align-top break-all">{tag.content}</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<p class="hint">
		Clear the title and the template is skipped — no stray
		<span class="value accent">" — Svelte Use"</span>. Change
		<span class="value accent">og:type</span> and note that
		<span class="value accent">og:site_name</span> and
		<span class="value accent">og:image</span> survive: sections merge per key, so a partial override
		stays partial.
	</p>
	<p class="hint">
		This page's real metadata is rendered once by the root layout. These tags are only computed, not
		applied — rendering a second <span class="value accent">&lt;Seo /&gt;</span> here would emit duplicates.
	</p>
</div>

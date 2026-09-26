<script lang="ts">
	import { useSeo, type SeoData } from '$lib';

	/*
	 * Deliberately does NOT render <Seo />.
	 *
	 * The root layout already renders one for this page. A second instance
	 * would append another <title> and another <meta name="description"> to
	 * the same head — the exact duplication this component's docs warn about,
	 * on the very page documenting it. So the markup it *would* produce is
	 * shown as text instead.
	 */
	let title = $state('Seo');
	let description = $state('Renders SEO metadata into svelte:head.');

	const data: SeoData = $derived({
		title: title || undefined,
		titleTemplate: '%s — Svelte Use',
		baseUrl: 'https://svelte-use.ariefsn.dev',
		description: description || undefined,
		og: {
			siteName: 'Svelte Use',
			image: '/og-image.png',
			imageWidth: 1200,
			imageHeight: 630,
			type: 'article'
		},
		twitter: { card: 'summary' }
	});

	const seo = useSeo(() => data);

	const markup = $derived(
		[
			'<svelte:head>',
			seo.title() ? `  <title>${seo.title()}</title>` : null,
			...seo
				.tags()
				.map((tag) =>
					tag.rel
						? `  <link rel="${tag.rel}" href="${tag.content}" />`
						: tag.property
							? `  <meta property="${tag.property}" content="${tag.content}" />`
							: `  <meta name="${tag.name}" content="${tag.content}" />`
				),
			'</svelte:head>'
		]
			.filter((line) => line !== null)
			.join('\n')
	);
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label" style:min-width="7rem">title</span>
		<input type="text" bind:value={title} placeholder="(none)" />
	</div>
	<div class="row">
		<span class="label" style:min-width="7rem">description</span>
		<input type="text" bind:value={description} placeholder="(none)" />
	</div>

	<div class="divider"></div>

	<p class="muted m-0 text-[0.8rem]">
		What <code class="inline-code">&lt;Seo {'{data}'} /&gt;</code> would render:
	</p>

	<pre
		class="bg-bg border-border m-0 overflow-x-auto rounded-lg border p-3 text-[0.72rem] leading-relaxed"><code
			class="text-accent">{markup}</code
		></pre>

	<p class="hint">
		This demo deliberately does <strong>not</strong> render the component. The root layout already
		renders one for this page, and a second would append a duplicate title and description to the
		same head — the exact failure the docs warn about. Clear the title and the
		<span class="value accent">&lt;title&gt;</span> line disappears entirely rather than rendering empty.
	</p>
</div>

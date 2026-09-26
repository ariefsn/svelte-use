<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { Seo, useColorMode, useSeo, type SeoData } from '$lib';
	import { NEW_IN_VERSION, groupHasNew, isNew, sidebar } from '../docs/sidebar.js';
	import '../app.css';

	let { children } = $props();

	/*
	 * Site-wide SEO defaults. `baseUrl` is not optional here: during
	 * prerendering `page.url.origin` is `http://sveltekit-prerender`, so
	 * deriving absolute URLs from the request would ship that placeholder.
	 *
	 * Deliberately not module-scoped — module-level mutable state is shared
	 * across concurrent requests on the server, so one visitor's metadata
	 * could leak into another's response.
	 */
	const seoDefaults: SeoData = {
		titleTemplate: '%s — Svelte Use',
		baseUrl: 'https://svelte-use.ariefsn.dev',
		description:
			'Svelte 5 runes-first utility composables. No stores, no external dependencies, SSR-safe and fully typed.',
		og: {
			siteName: 'Svelte Use',
			// A raster image on purpose: Facebook, X, LinkedIn and WhatsApp do
			// not render SVG previews, so the logo.svg used here previously
			// meant every shared link showed a card with no image at all.
			// Regenerate from scripts/og-image.svg — see the note in that file.
			image: '/og-image.png',
			imageWidth: 1200,
			imageHeight: 630,
			imageType: 'image/png',
			imageAlt: 'svelte-use — Svelte 5 runes-first utility composables',
			type: 'website'
		},
		twitter: { card: 'summary' }
	};

	/*
	 * The single render site for metadata. Svelte concatenates <svelte:head>
	 * blocks and does not deduplicate meta tags, so a second <Seo /> on a page
	 * would emit two descriptions and crawlers would take the first — the
	 * layout default. Merge here, render once.
	 */
	const seo = useSeo(
		seoDefaults,
		() => page.data.seo,
		() => ({ canonical: page.url.pathname })
	);

	/*
	 * Drives the `class` on <html>, which is what the token overrides in
	 * app.css key off. `initialValue: 'dark'` is a hard default: a first-time
	 * visitor on a light-mode OS still sees the site as it has always looked.
	 *
	 * The matching pre-paint script lives in app.html — this runs after
	 * hydration, so it cannot prevent the first-paint flash on its own.
	 */
	const theme = useColorMode({ initialValue: 'dark' });
	const themeOptions = ['auto', 'light', 'dark'] as const;

	let openGroups = $state<Record<string, boolean>>({});
	let mobileMenuOpen = $state(false);
	let searchQuery = $state('');

	let filteredItems = $derived(
		searchQuery.trim()
			? sidebar.flatMap((group) =>
					group.items
						.filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
						.map((item) => ({ ...item, group: group.title }))
				)
			: []
	);

	// Auto-open group containing the active slug
	$effect(() => {
		const slug = page.params.slug;
		if (slug) {
			for (const group of sidebar) {
				if (group.items.some((i) => i.slug === slug)) {
					openGroups[group.title] = true;
				}
			}
		}
	});

	// Close mobile menu on navigation
	$effect(() => {
		// Read the pathname so this effect re-runs on navigation. Assigned
		// rather than left as a bare expression so the intent is explicit.
		const _pathname = page.url.pathname;
		mobileMenuOpen = false;
	});

	function toggleGroup(title: string) {
		openGroups[title] = !openGroups[title];
	}

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	const navItemBase =
		'flex items-center gap-1.5 rounded-[5px] py-[0.3rem] pr-[0.6rem] pl-4 font-mono text-[0.85rem] no-underline transition-colors';
	const navItemIdle = 'text-text-muted hover:bg-surface hover:text-text';
	const navItemActive = 'bg-accent-bg text-accent';
</script>

<Seo data={seo.data()} />

<div class="flex min-h-screen">
	<!-- Mobile top bar -->
	<div
		class="bg-bg-sunken border-border fixed top-0 right-0 left-0 z-100 flex items-center justify-between border-b px-4 py-3 md:hidden"
	>
		<a href={resolve('/')} class="flex items-center gap-2 no-underline">
			<img src="/logo.svg" alt="svelte-use logo" class="h-7 w-7 shrink-0" width="28" height="28" />
			<span class="text-accent font-mono text-[0.95rem] font-bold tracking-tight">Svelte Use</span>
		</a>

		<div class="flex items-center gap-1">
			<div class="border-border flex items-center gap-0.5 rounded-md border p-0.5">
				{#each themeOptions as option (option)}
					<button
						class="cursor-pointer rounded px-1.5 py-0.5 text-[0.65rem] transition-colors {theme.mode() ===
						option
							? 'bg-accent-bg text-accent'
							: 'text-text-faint hover:text-text'}"
						onclick={() => theme.set(option)}
						aria-pressed={theme.mode() === option}
					>
						{option}
					</button>
				{/each}
			</div>

			<button
				class="text-text-muted hover:bg-surface hover:text-text flex cursor-pointer items-center justify-center rounded-md p-1 transition-colors"
				onclick={toggleMobileMenu}
				aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
				aria-expanded={mobileMenuOpen}
			>
				{#if mobileMenuOpen}
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
						<path
							d="M4 4L16 16M16 4L4 16"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
						/>
					</svg>
				{:else}
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
						<path
							d="M3 5h14M3 10h14M3 15h14"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
						/>
					</svg>
				{/if}
			</button>
		</div>
	</div>

	<!-- Sidebar / mobile drawer -->
	<nav
		class="bg-bg-sunken border-border sticky top-0 z-200 flex h-screen w-[304px] shrink-0 flex-col overflow-y-auto border-r py-5 max-md:fixed max-md:w-[320px] max-md:transition-[left] max-md:duration-250 {mobileMenuOpen
			? 'max-md:left-0 max-md:shadow-[4px_0_24px_var(--color-overlay)]'
			: 'max-md:-left-[320px]'}"
		aria-label="Documentation navigation"
	>
		<a
			href={resolve('/')}
			class="border-border mb-3 flex items-center gap-2 border-b px-5 pb-5 no-underline max-md:hidden"
		>
			<img src="/logo.svg" alt="svelte-use logo" class="h-7 w-7 shrink-0" width="28" height="28" />
			<span class="text-accent font-mono text-[0.95rem] font-bold tracking-tight">Svelte Use</span>
		</a>

		<div class="px-3 pb-2">
			<a
				href={resolve('/')}
				class="block rounded-md px-[0.6rem] py-[0.35rem] text-[0.85rem] no-underline transition-colors {page
					.url.pathname === '/'
					? 'bg-accent-bg text-accent'
					: 'text-text-muted hover:bg-surface hover:text-text'}">Home</a
			>
		</div>

		<!-- Theme -->
		<div class="px-3 pb-2 max-md:hidden">
			<div class="border-border flex items-center gap-0.5 rounded-md border p-0.5">
				{#each themeOptions as option (option)}
					<button
						class="flex-1 cursor-pointer rounded px-2 py-1 text-[0.7rem] capitalize transition-colors {theme.mode() ===
						option
							? 'bg-accent-bg text-accent'
							: 'text-text-faint hover:text-text'}"
						onclick={() => theme.set(option)}
						aria-pressed={theme.mode() === option}
						title={option === 'auto' ? `Follow the system (${theme.system()})` : `Always ${option}`}
					>
						{option}
					</button>
				{/each}
			</div>
		</div>

		<div class="px-3 pb-2">
			<div class="relative flex items-center">
				<svg
					class="text-text-faint pointer-events-none absolute left-[0.55rem] shrink-0"
					width="13"
					height="13"
					viewBox="0 0 13 13"
					fill="none"
					aria-hidden="true"
				>
					<circle cx="5.5" cy="5.5" r="4" stroke="currentColor" stroke-width="1.5" />
					<path
						d="M9 9L11.5 11.5"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
					/>
				</svg>
				<input
					type="text"
					class="bg-bg border-border text-text placeholder:text-text-faint focus:border-accent-border w-full rounded-md border py-[0.35rem] pr-7 pl-[1.85rem] text-[0.82rem] transition-colors outline-none"
					placeholder="Search..."
					bind:value={searchQuery}
					aria-label="Search composables"
				/>
				{#if searchQuery}
					<button
						class="text-text-faint hover:text-text absolute right-[0.45rem] flex cursor-pointer items-center justify-center rounded p-[0.2rem] transition-colors"
						onclick={() => (searchQuery = '')}
						aria-label="Clear search"
					>
						<svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
							<path
								d="M1 1L9 9M9 1L1 9"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
							/>
						</svg>
					</button>
				{/if}
			</div>
		</div>

		{#if searchQuery.trim()}
			<div class="flex flex-col gap-px px-3">
				{#if filteredItems.length === 0}
					<p class="text-text-faint m-0 px-[0.6rem] py-[0.35rem] text-[0.82rem]">No results</p>
				{:else}
					{#each filteredItems as item (item.slug)}
						<a
							href={resolve('/docs/[slug]', { slug: item.slug })}
							class="{navItemBase} justify-between {page.params.slug === item.slug
								? navItemActive
								: navItemIdle}"
							onclick={() => (searchQuery = '')}
						>
							<span class="flex min-w-0 items-center gap-1.5">
								<span class="min-w-0 truncate">{item.label}</span>
								{#if isNew(item)}
									<span
										class="text-accent-strong bg-accent-border/40 border-accent-dim shrink-0 rounded border px-[0.3rem] py-[0.15rem] font-sans text-[0.6rem] leading-none font-semibold tracking-wide uppercase"
										title="Added in v{NEW_IN_VERSION}">new</span
									>
								{/if}
							</span>
							<span class="text-text-faint shrink-0 font-sans text-[0.7rem] whitespace-nowrap"
								>{item.group}</span
							>
						</a>
					{/each}
				{/if}
			</div>
		{:else}
			{#each sidebar as group (group.title)}
				<div class="mb-1 px-3">
					<button
						class="hover:bg-bg-elev flex w-full cursor-pointer items-center justify-between rounded-md px-[0.6rem] py-[0.35rem] text-left text-[0.75rem] font-semibold tracking-[0.06em] uppercase transition-colors {openGroups[
							group.title
						]
							? 'text-text-muted'
							: 'text-text-faint hover:text-text-muted'}"
						onclick={() => toggleGroup(group.title)}
					>
						<span class="min-w-0 flex-1 truncate whitespace-nowrap">{group.title}</span>
						<!--
							The dot and chevron sit in a fixed-width trailing cluster rather
							than inline after the title. Inline, the dot landed at a different
							x for every group, because the title length varies. The slot is
							rendered even when empty so the chevron never shifts either.
						-->
						<span class="ml-2 flex shrink-0 items-center gap-2">
							<span class="flex h-1.5 w-1.5 items-center justify-center">
								{#if groupHasNew(group) && !openGroups[group.title]}
									<!--
										Only while collapsed: once open, each new child carries its
										own badge and the dot would be redundant noise.
									-->
									<span
										class="bg-accent ring-accent-border h-1.5 w-1.5 rounded-full ring-2"
										title="Contains utils added in v{NEW_IN_VERSION}"
										aria-label="Contains new utils"
									></span>
								{/if}
							</span>
							<svg
								class="opacity-50 transition-transform duration-200 {openGroups[group.title]
									? 'rotate-180'
									: ''}"
								width="12"
								height="12"
								viewBox="0 0 12 12"
								fill="none"
								aria-hidden="true"
							>
								<path
									d="M2 4L6 8L10 4"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						</span>
					</button>

					{#if openGroups[group.title]}
						<ul class="mt-1 mb-2 flex list-none flex-col gap-px p-0">
							{#each group.items as item (item.slug)}
								<li>
									<a
										href={resolve('/docs/[slug]', { slug: item.slug })}
										class="{navItemBase} {page.params.slug === item.slug
											? navItemActive
											: navItemIdle}"
									>
										<span class="min-w-0 truncate">{item.label}</span>
										{#if isNew(item)}
											<span
												class="text-accent-strong bg-accent-border/40 border-accent-dim shrink-0 rounded border px-[0.3rem] py-[0.15rem] font-sans text-[0.6rem] leading-none font-semibold tracking-wide uppercase"
												title="Added in v{NEW_IN_VERSION}">new</span
											>
										{/if}
									</a>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			{/each}
		{/if}
	</nav>

	<!-- Overlay for mobile -->
	{#if mobileMenuOpen}
		<div
			class="bg-overlay fixed inset-0 z-150 hidden cursor-pointer max-md:block"
			onclick={toggleMobileMenu}
			role="button"
			tabindex="-1"
			aria-label="Close menu"
			onkeydown={(e) => e.key === 'Escape' && toggleMobileMenu()}
		></div>
	{/if}

	<main class="min-w-0 flex-1 px-10 py-12 max-md:px-5 max-md:pt-20 max-md:pb-8">
		<!--
			`main` is deliberately uncapped and the measure lives here instead.
			Capping `main` without `mx-auto` was what piled every spare pixel on
			the right of the page: the flex row packs both children left, so the
			slack had nowhere else to go.

			Wrapping the slot rather than each page means every route gets the
			measure, including SvelteKit's built-in error page, which has no
			wrapper of its own. Pages needing a narrower column cap themselves
			inside this box; both are centred, so nesting the two lands the
			inner one exactly where it would have been anyway — a docs page caps its
			row at 1020, so this outer bound only ever matters to the homepage,
			which is grids rather than prose and has no reading measure to protect.
		-->
		<div class="mx-auto w-full max-w-[1400px]">
			{@render children()}
		</div>
	</main>
</div>

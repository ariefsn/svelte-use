<script lang="ts">
	import { page } from '$app/stores';
	import { sidebar } from '$lib/docs/sidebar.js';

	let { children } = $props();

	let openGroups = $state<Record<string, boolean>>({});
	let mobileMenuOpen = $state(false);

	// Auto-open group containing the active slug
	$effect(() => {
		const slug = $page.params.slug;
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
		$page.url.pathname;
		mobileMenuOpen = false;
	});

	function toggleGroup(title: string) {
		openGroups[title] = !openGroups[title];
	}

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}
</script>

<div class="layout">
	<!-- Mobile top bar -->
	<div class="mobile-topbar">
		<a href="/" class="logo">
			<img src="/logo.svg" alt="svelte-use logo" class="logo-img" width="28" height="28" />
			<span class="logo-text">Svelte Use</span>
		</a>
		<button
			class="hamburger"
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

	<!-- Sidebar / mobile drawer -->
	<nav class="sidebar" class:mobile-open={mobileMenuOpen} aria-label="Documentation navigation">
		<a href="/" class="logo desktop-logo">
			<img src="/logo.svg" alt="svelte-use logo" class="logo-img" width="28" height="28" />
			<span class="logo-text">Svelte Use</span>
		</a>

		<div class="nav-section">
			<a href="/" class="nav-home" class:active={$page.url.pathname === '/'}>Home</a>
		</div>

		{#each sidebar as group}
			<div class="nav-group">
				<button
					class="group-title"
					class:open={openGroups[group.title]}
					onclick={() => toggleGroup(group.title)}
				>
					<span>{group.title}</span>
					<svg
						class="chevron"
						class:rotated={openGroups[group.title]}
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
				</button>

				{#if openGroups[group.title]}
					<ul class="group-items">
						{#each group.items as item}
							<li>
								<a
									href="/docs/{item.slug}"
									class="nav-item"
									class:active={$page.params.slug === item.slug}
								>
									{item.label}
								</a>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		{/each}
	</nav>

	<!-- Overlay for mobile -->
	{#if mobileMenuOpen}
		<div
			class="overlay"
			onclick={toggleMobileMenu}
			role="button"
			tabindex="-1"
			aria-label="Close menu"
			onkeydown={(e) => e.key === 'Escape' && toggleMobileMenu()}
		></div>
	{/if}

	<main class="content">
		{@render children()}
	</main>
</div>

<style>
	:global(body) {
		font-family: system-ui, sans-serif;
		background: #0f0f0f;
		color: #e8e8e8;
		margin: 0;
		padding: 0;
	}

	:global(*) {
		box-sizing: border-box;
	}

	.layout {
		display: flex;
		min-height: 100vh;
	}

	/* ─── Mobile top bar ─── */
	.mobile-topbar {
		display: none;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 100;
		background: #0a0a0a;
		border-bottom: 1px solid #1e1e1e;
		padding: 0.75rem 1rem;
		align-items: center;
		justify-content: space-between;
	}

	.hamburger {
		background: none;
		border: none;
		color: #888;
		cursor: pointer;
		padding: 0.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 6px;
		transition:
			color 0.15s,
			background 0.15s;
	}

	.hamburger:hover {
		color: #e8e8e8;
		background: #1e1e1e;
	}

	/* ─── Sidebar ─── */
	.sidebar {
		width: 240px;
		flex-shrink: 0;
		background: #0a0a0a;
		border-right: 1px solid #1e1e1e;
		padding: 1.25rem 0;
		position: sticky;
		top: 0;
		height: 100vh;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0 1.25rem 1.25rem;
		text-decoration: none;
		border-bottom: 1px solid #1e1e1e;
		margin-bottom: 0.75rem;
	}

	.logo-img {
		width: 28px;
		height: 28px;
		flex-shrink: 0;
	}

	.logo-text {
		font-size: 0.95rem;
		font-weight: 700;
		color: #a78bfa;
		font-family: monospace;
		letter-spacing: -0.02em;
	}

	.desktop-logo {
		display: flex;
	}

	.nav-section {
		padding: 0 0.75rem 0.5rem;
	}

	.nav-home {
		display: block;
		padding: 0.35rem 0.6rem;
		border-radius: 6px;
		text-decoration: none;
		color: #888;
		font-size: 0.85rem;
		transition:
			color 0.15s,
			background 0.15s;
	}

	.nav-home:hover {
		color: #e8e8e8;
		background: #1e1e1e;
	}

	.nav-home.active {
		color: #a78bfa;
		background: #1a1630;
	}

	/* ─── Groups ─── */
	.nav-group {
		padding: 0 0.75rem;
		margin-bottom: 0.25rem;
	}

	.group-title {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: none;
		border: none;
		padding: 0.35rem 0.6rem;
		border-radius: 6px;
		color: #555;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		cursor: pointer;
		transition:
			color 0.15s,
			background 0.15s;
		text-align: left;
	}

	.group-title:hover {
		color: #888;
		background: #161616;
	}

	.group-title.open {
		color: #888;
	}

	.chevron {
		transition: transform 0.2s;
		opacity: 0.5;
	}

	.chevron.rotated {
		transform: rotate(180deg);
	}

	.group-items {
		list-style: none;
		margin: 0.25rem 0 0.5rem;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.nav-item {
		display: block;
		padding: 0.3rem 0.6rem 0.3rem 1rem;
		border-radius: 5px;
		text-decoration: none;
		color: #777;
		font-size: 0.85rem;
		font-family: monospace;
		transition:
			color 0.15s,
			background 0.15s;
	}

	.nav-item:hover {
		color: #e8e8e8;
		background: #1e1e1e;
	}

	.nav-item.active {
		color: #a78bfa;
		background: #1a1630;
	}

	/* ─── Content ─── */
	.content {
		flex: 1;
		min-width: 0;
		padding: 3rem 2.5rem;
		max-width: 860px;
	}

	/* ─── Overlay ─── */
	.overlay {
		display: none;
	}

	/* ─── Mobile ─── */
	@media (max-width: 768px) {
		.mobile-topbar {
			display: flex;
		}

		.desktop-logo {
			display: none;
		}

		.sidebar {
			position: fixed;
			top: 0;
			left: -260px;
			width: 260px;
			height: 100vh;
			z-index: 200;
			transition: left 0.25s ease;
			padding-top: 1.25rem;
			box-shadow: none;
		}

		.sidebar.mobile-open {
			left: 0;
			box-shadow: 4px 0 24px rgba(0, 0, 0, 0.6);
		}

		.sidebar .logo {
			display: flex;
		}

		.overlay {
			display: block;
			position: fixed;
			inset: 0;
			background: rgba(0, 0, 0, 0.6);
			z-index: 150;
			cursor: pointer;
		}

		.content {
			padding: 5rem 1.25rem 2rem;
			max-width: 100%;
		}
	}
</style>

<script lang="ts">
	import { page } from '$app/stores';
	import { sidebar } from '$lib/docs/sidebar.js';

	let { children } = $props();

	let openGroups = $state<Record<string, boolean>>({});

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

	function toggleGroup(title: string) {
		openGroups[title] = !openGroups[title];
	}
</script>

<div class="layout">
	<nav class="sidebar">
		<a href="/" class="logo">
			<span class="logo-icon">⚡</span>
			<span class="logo-text">svelte-use</span>
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
					>
						<path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
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

	.logo-icon {
		font-size: 1.1rem;
	}

	.logo-text {
		font-size: 0.95rem;
		font-weight: 700;
		color: #a78bfa;
		font-family: monospace;
		letter-spacing: -0.02em;
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
		transition: color 0.15s, background 0.15s;
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
		transition: color 0.15s, background 0.15s;
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
		transition: color 0.15s, background 0.15s;
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

	@media (max-width: 768px) {
		.sidebar {
			display: none;
		}

		.content {
			padding: 2rem 1.25rem;
		}
	}
</style>

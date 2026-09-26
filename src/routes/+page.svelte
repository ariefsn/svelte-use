<script lang="ts">
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';
	import { sidebar } from '../docs/sidebar.js';

	const features = [
		{
			icon: '⚡',
			label: 'Svelte 5 Runes',
			desc: 'Built for $state, $derived, $effect — no stores'
		},
		{ icon: '🌲', label: 'Tree-shakable', desc: 'Import only what you use' },
		{ icon: '🔒', label: 'Fully typed', desc: 'First-class TypeScript, no any' },
		{ icon: '🌐', label: 'SSR safe', desc: 'All browser APIs are guarded' },
		{ icon: '📦', label: 'Zero deps', desc: 'No runtime dependencies' },
		{ icon: '🧹', label: 'Auto cleanup', desc: 'Listeners removed on component destroy' },
		{ icon: '🎞️', label: 'Animation', desc: 'useAnimate, useParallax, useTransition' },
		{ icon: '🔌', label: 'Async & WebSocket', desc: 'useFetch, useWebSocket' },
		{ icon: '⏱️', label: 'Time utilities', desc: 'useInterval, useTimeout, useNow, useTimestamp…' },
		{ icon: '🖱️', label: 'Pointer & Drag', desc: 'useMouse, useDraggable, useDropZone, useSwipe…' },
		{
			icon: '📡',
			label: 'Sensors',
			desc: 'useGeolocation, useDeviceMotion, useDeviceOrientation…'
		},
		{ icon: '💾', label: 'Storage', desc: 'useLocalStorage, useIndexedDB, useSessionStorage…' },
		{
			icon: '🔔',
			label: 'Notifications & APIs',
			desc: 'useWebNotification, usePermission, useShare, useVibrate…'
		},
		{ icon: '👆', label: 'Gestures', desc: 'useLongPress, useSwipe, useStartTyping…' },
		{
			icon: '↩️',
			label: 'History & State',
			desc: 'useHistoryState, useTrackHistory, useAutoResetState…'
		}
	];

	// Total composable count from sidebar
	const totalComposables = sidebar.reduce((acc, g) => acc + g.items.length, 0);

	// ── Shared class strings ──────────────────────────────────────────────────
	const badge =
		'bg-accent-bg text-accent border-accent-border inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 font-mono text-[0.78rem]';
	const btn =
		'inline-flex cursor-pointer items-center rounded-lg px-5 py-2 text-[0.9rem] font-medium no-underline transition-colors';
	const sectionTitle = 'm-0 mb-4 flex items-center gap-2 text-[1.35rem] font-bold tracking-tight';
	const card = 'bg-bg-elev border-border rounded-[10px] border px-4.5 py-4';
	const codeBlock = 'bg-bg border-border m-0 overflow-x-auto rounded-lg border px-5 py-4.5';
	const codeText =
		"text-accent font-['Fira_Code','Cascadia_Code',monospace] text-[0.82rem] whitespace-pre";
</script>

<svelte:head>
	<title>Svelte Use — Svelte 5 Utility Composables</title>
	<meta
		name="description"
		content="A collection of {totalComposables}+ Svelte 5 runes-first utility composables. No stores, no external dependencies, SSR-safe, fully typed."
	/>
	<meta property="og:title" content="Svelte Use — Svelte 5 Utility Composables" />
	<meta
		property="og:description"
		content="A collection of {totalComposables}+ Svelte 5 runes-first utility composables. No stores, no external dependencies, SSR-safe, fully typed."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content={$page.url.href} />
	<meta property="og:image" content="{$page.url.origin}/logo.svg" />
	<meta property="og:site_name" content="Svelte Use" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Svelte Use — Svelte 5 Utility Composables" />
	<meta
		name="twitter:description"
		content="A collection of {totalComposables}+ Svelte 5 runes-first utility composables. No stores, no external dependencies, SSR-safe, fully typed."
	/>
	<meta name="twitter:image" content="{$page.url.origin}/logo.svg" />
</svelte:head>

<div class="max-w-[900px]">
	<!-- ─── Hero ─── -->
	<header class="border-border mb-12 border-b pb-12">
		<div class="mb-5 flex flex-wrap items-center gap-4">
			<img
				src="/logo.svg"
				alt="svelte-use logo"
				class="h-18 w-18 shrink-0 max-sm:h-14 max-sm:w-14"
				width="80"
				height="80"
			/>
			<div class="flex flex-wrap items-center gap-2">
				<span class={badge}>@ariefsn/svelte-use</span>
				<a
					href="https://www.npmjs.com/package/@ariefsn/svelte-use"
					class="{badge} hover:bg-accent-border/30 hover:border-accent-dim no-underline transition-colors"
					target="_blank"
					rel="noopener"
					aria-label="View on npm"
				>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
						><path d="M0 0v24h24V0H0zm19.2 19.2H4.8V4.8h14.4v14.4z" /><path
							d="M7.2 7.2h9.6v9.6h-2.4V9.6H12v7.2H7.2z"
						/></svg
					>
					npm
				</a>
				<a
					href="https://github.com/ariefsn/svelte-use"
					class="{badge} hover:bg-accent-border/30 hover:border-accent-dim no-underline transition-colors"
					target="_blank"
					rel="noopener"
					aria-label="View on GitHub"
				>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
						><path
							d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
						/></svg
					>
					GitHub
				</a>
			</div>
		</div>

		<!--
			The gradient needs `text-transparent` plus a background clip, which has
			no single utility — `bg-clip-text` provides the clip and the gradient
			utilities supply the rest.
		-->
		<h1
			class="from-text to-accent m-0 mb-3 bg-gradient-to-br bg-clip-text text-[clamp(2rem,6vw,3rem)] font-extrabold tracking-[-0.04em] text-transparent"
		>
			Svelte Use
		</h1>
		<p class="text-text-muted m-0 mb-7 text-[1.05rem] leading-relaxed max-sm:text-[0.95rem]">
			A collection of <strong>{totalComposables}+</strong> Svelte 5 runes-first utility composables.<br
			/>
			No stores. No external dependencies. SSR-safe. Fully typed.
		</p>

		<div class="flex flex-wrap gap-3">
			<a
				href={resolve('/docs/[slug]', { slug: 'use-toggle' })}
				class="{btn} bg-accent text-bg hover:bg-accent-strong">Browse Docs</a
			>
			<a
				href="https://github.com/ariefsn/svelte-use"
				class="{btn} bg-surface text-text border-border-strong hover:bg-surface-2 border"
				target="_blank"
				rel="noopener">GitHub</a
			>
			<a
				href="https://www.npmjs.com/package/@ariefsn/svelte-use"
				class="{btn} bg-surface text-text border-border-strong hover:bg-surface-2 border"
				target="_blank"
				rel="noopener">npm</a
			>
		</div>
	</header>

	<!-- ─── Install ─── -->
	<section class="mb-14">
		<h2 class={sectionTitle}>Installation</h2>
		<pre class={codeBlock}><code class={codeText}
				>{`npm install @ariefsn/svelte-use
# or
pnpm add @ariefsn/svelte-use
# or
bun add @ariefsn/svelte-use`}</code
			></pre>
		<p class="text-text-muted mt-2 mb-0 text-[0.85rem]">
			Requires <strong class="text-accent">Svelte 5</strong> as a peer dependency.
		</p>
	</section>

	<!-- ─── Quick Start ─── -->
	<section class="mb-14">
		<h2 class={sectionTitle}>Quick Start</h2>
		<p class="doc-prose text-text-dim m-0 mb-4 text-[0.95rem] leading-relaxed">
			All composables follow the runes-first pattern. State is exposed as <strong
				>getter functions</strong
			>
			backed by <code>$state</code> — call them in templates or <code>$derived</code> to read reactively.
		</p>
		<pre class={codeBlock}><code class={codeText}
				>{`import { useMouse, useScroll, useCountdown } from '@ariefsn/svelte-use';

// Tracks pointer position
const mouse = useMouse();
mouse.x()   // → number (reactive)
mouse.y()   // → number (reactive)

// Tracks scroll state of window or any element
const scroll = useScroll();
scroll.y()                   // → number
scroll.arrivedState.bottom() // → boolean

// Countdown timer
const timer = useCountdown(60);
timer.start();
timer.count()    // → 60, 59, 58 …`}</code
			></pre>
	</section>

	<!-- ─── Features ─── -->
	<section class="mb-14">
		<h2 class={sectionTitle}>Features</h2>
		<div
			class="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 max-sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))]"
		>
			{#each features as f (f.label)}
				<div class="{card} flex flex-col gap-1">
					<span class="mb-0.5 text-[1.3rem]">{f.icon}</span>
					<strong class="text-text text-[0.9rem]">{f.label}</strong>
					<span class="text-text-muted text-[0.8rem]">{f.desc}</span>
				</div>
			{/each}
		</div>
	</section>

	<!-- ─── Category Overview ─── -->
	<section class="mb-14">
		<h2 class={sectionTitle}>
			Utilities
			<span
				class="bg-accent-bg text-accent border-accent-border inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 font-mono text-[0.75rem] font-semibold"
				>{totalComposables}</span
			>
		</h2>
		<div class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
			{#each sidebar as group (group.title)}
				<div class={card}>
					<h3
						class="text-text-faint m-0 mb-2.5 text-[0.78rem] font-semibold tracking-[0.06em] uppercase"
					>
						{group.title}
					</h3>
					<ul class="m-0 flex list-none flex-col gap-0.5 p-0">
						{#each group.items as item (item.slug)}
							<li>
								<a
									href={resolve('/docs/[slug]', { slug: item.slug })}
									class="text-text-muted hover:text-accent block py-1 font-mono text-[0.85rem] no-underline transition-colors"
									>{item.label}</a
								>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</section>

	<!-- ─── Footer ─── -->
	<footer class="border-border mt-8 flex flex-col items-center gap-4 border-t py-8 text-center">
		<div class="text-accent flex items-center gap-2 font-mono text-[0.95rem] font-bold">
			<img src="/logo.svg" alt="svelte-use logo" width="24" height="24" />
			<span>Svelte Use</span>
		</div>
		<div class="flex gap-6">
			<a
				href="https://github.com/ariefsn/svelte-use"
				target="_blank"
				rel="noopener"
				class="text-text-muted hover:text-accent flex items-center gap-1.5 text-[0.85rem] no-underline transition-colors"
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
					><path
						d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
					/></svg
				>
				GitHub
			</a>
			<a
				href="https://www.npmjs.com/package/@ariefsn/svelte-use"
				target="_blank"
				rel="noopener"
				class="text-text-muted hover:text-accent flex items-center gap-1.5 text-[0.85rem] no-underline transition-colors"
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
					><path d="M0 0v24h24V0H0zm19.2 19.2H4.8V4.8h14.4v14.4z" /><path
						d="M7.2 7.2h9.6v9.6h-2.4V9.6H12v7.2H7.2z"
					/></svg
				>
				npm
			</a>
		</div>
		<p class="text-text-faint m-0 text-[0.8rem]">MIT License · Built with Svelte 5</p>
	</footer>
</div>

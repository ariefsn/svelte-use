<script lang="ts">
	import { page as appPage } from '$app/stores';
	import { sidebar } from '../../../docs/sidebar.js';
	import type { PageData } from './$types.js';
	// ── Demo components ──────────────────────────────────────────────────────
	import DemoUseAnimate from './demos/use-animate.svelte';
	import DemoUseBase64 from './demos/use-base64.svelte';
	import DemoUseBattery from './demos/use-battery.svelte';
	import DemoUseBreakpoints from './demos/use-breakpoints.svelte';
	import DemoUseBrowserLocation from './demos/use-browser-location.svelte';
	import DemoUseClickOutside from './demos/use-click-outside.svelte';
	import DemoUseClipboard from './demos/use-clipboard.svelte';
	import DemoUseCountdown from './demos/use-countdown.svelte';
	import DemoUseCounter from './demos/use-counter.svelte';
	import DemoUseCycleList from './demos/use-cycle-list.svelte';
	import DemoUseDebounceFn from './demos/use-debounce-fn.svelte';
	import DemoUseDebounce from './demos/use-debounce.svelte';
	import DemoUseDraggable from './demos/use-draggable.svelte';
	import DemoUseDropZone from './demos/use-drop-zone.svelte';
	import DemoUseElementHover from './demos/use-element-hover.svelte';
	import DemoUseElementSize from './demos/use-element-size.svelte';
	import DemoUseFetch from './demos/use-fetch.svelte';
	import DemoUseFocus from './demos/use-focus.svelte';
	import DemoUseFps from './demos/use-fps.svelte';
	import DemoUseGeolocation from './demos/use-geolocation.svelte';
	import DemoUseIdle from './demos/use-idle.svelte';
	import DemoUseIndexedDB from './demos/use-indexed-db.svelte';
	import DemoUseIntersectionObserver from './demos/use-intersection-observer.svelte';
	import DemoUseIntervalFn from './demos/use-interval-fn.svelte';
	import DemoUseInterval from './demos/use-interval.svelte';
	import DemoUseKeyModifier from './demos/use-key-modifier.svelte';
	import DemoUseLocalStorage from './demos/use-local-storage.svelte';
	import DemoUseMagicKeys from './demos/use-magic-keys.svelte';
	import DemoUseMousePressed from './demos/use-mouse-pressed.svelte';
	import DemoUseMouse from './demos/use-mouse.svelte';
	import DemoUseMutationObserver from './demos/use-mutation-observer.svelte';
	import DemoUseNavigatorLanguage from './demos/use-navigator-language.svelte';
	import DemoUseNetwork from './demos/use-network.svelte';
	import DemoUseNow from './demos/use-now.svelte';
	import DemoUseObjectUrl from './demos/use-object-url.svelte';
	import DemoUseOnline from './demos/use-online.svelte';
	import DemoUsePageLeave from './demos/use-page-leave.svelte';
	import DemoUseParallax from './demos/use-parallax.svelte';
	import DemoUsePrevious from './demos/use-previous.svelte';
	import DemoUseResizeObserver from './demos/use-resize-observer.svelte';
	import DemoUseScrollLock from './demos/use-scroll-lock.svelte';
	import DemoUseScroll from './demos/use-scroll.svelte';
	import DemoUseSessionStorage from './demos/use-session-storage.svelte';
	import DemoUseSorted from './demos/use-sorted.svelte';
	import DemoUseSpeechRecognition from './demos/use-speech-recognition.svelte';
	import DemoUseThrottleFn from './demos/use-throttle-fn.svelte';
	import DemoUseTimeAgo from './demos/use-time-ago.svelte';
	import DemoUseTimeoutFn from './demos/use-timeout-fn.svelte';
	import DemoUseTimeoutPoll from './demos/use-timeout-poll.svelte';
	import DemoUseTimeout from './demos/use-timeout.svelte';
	import DemoUseTimestamp from './demos/use-timestamp.svelte';
	import DemoUseToggle from './demos/use-toggle.svelte';
	import DemoUseTransition from './demos/use-transition.svelte';
	import DemoUseVirtualList from './demos/use-virtual-list.svelte';
	import DemoUseWebSocket from './demos/use-web-socket.svelte';

	// ── v1.1.0 demo imports ──────────────────────────────────────────────────
	import DemoUseAutoResetState from './demos/use-auto-reset-state.svelte';
	import DemoUseDefaultState from './demos/use-default-state.svelte';
	import DemoUseLastChanged from './demos/use-last-changed.svelte';
	import DemoUseTrackHistory from './demos/use-track-history.svelte';
	import DemoUseHistoryState from './demos/use-history-state.svelte';
	import DemoUseWatch from './demos/use-watch.svelte';
	import DemoUseWhenever from './demos/use-whenever.svelte';
	import DemoUseAsyncState from './demos/use-async-state.svelte';
	import DemoUseEyeDropper from './demos/use-eye-dropper.svelte';
	import DemoUseFileDialog from './demos/use-file-dialog.svelte';
	import DemoUseShare from './demos/use-share.svelte';
	import DemoUseVibrate from './demos/use-vibrate.svelte';
	import DemoUseWebNotification from './demos/use-web-notification.svelte';
	import DemoUsePermission from './demos/use-permission.svelte';
	import DemoUseWakeLock from './demos/use-wake-lock.svelte';
	import DemoUseEventListener from './demos/use-event-listener.svelte';
	import DemoUseActiveElement from './demos/use-active-element.svelte';
	import DemoUseDocumentVisibility from './demos/use-document-visibility.svelte';
	import DemoUseWindowFocus from './demos/use-window-focus.svelte';
	import DemoUseTextDirection from './demos/use-text-direction.svelte';
	import DemoUseTextSelection from './demos/use-text-selection.svelte';
	import DemoUseDeviceMotion from './demos/use-device-motion.svelte';
	import DemoUseDeviceOrientation from './demos/use-device-orientation.svelte';
	import DemoUseDevicePixelRatio from './demos/use-device-pixel-ratio.svelte';
	import DemoUseScrollbarWidth from './demos/use-scrollbar-width.svelte';
	import DemoUseLongPress from './demos/use-long-press.svelte';
	import DemoUseStartTyping from './demos/use-start-typing.svelte';
	import DemoUseSwipe from './demos/use-swipe.svelte';
	import DemoUseNavigationGuard from './demos/use-navigation-guard.svelte';

	// ── Static slug → component map ──────────────────────────────────────────
	const demoMap: Record<string, any> = {
		'use-animate': DemoUseAnimate,
		'use-parallax': DemoUseParallax,
		'use-transition': DemoUseTransition,
		'use-fetch': DemoUseFetch,
		'use-web-socket': DemoUseWebSocket,
		'use-interval': DemoUseInterval,
		'use-interval-fn': DemoUseIntervalFn,
		'use-now': DemoUseNow,
		'use-timeout': DemoUseTimeout,
		'use-timeout-fn': DemoUseTimeoutFn,
		'use-timeout-poll': DemoUseTimeoutPoll,
		'use-timestamp': DemoUseTimestamp,
		'use-sorted': DemoUseSorted,
		'use-cycle-list': DemoUseCycleList,
		'use-countdown': DemoUseCountdown,
		'use-time-ago': DemoUseTimeAgo,
		'use-magic-keys': DemoUseMagicKeys,
		'use-key-modifier': DemoUseKeyModifier,
		'use-scroll': DemoUseScroll,
		'use-mouse': DemoUseMouse,
		'use-mouse-pressed': DemoUseMousePressed,
		'use-draggable': DemoUseDraggable,
		'use-element-size': DemoUseElementSize,
		'use-intersection-observer': DemoUseIntersectionObserver,
		'use-resize-observer': DemoUseResizeObserver,
		'use-mutation-observer': DemoUseMutationObserver,
		'use-idle': DemoUseIdle,
		'use-network': DemoUseNetwork,
		'use-geolocation': DemoUseGeolocation,
		'use-fps': DemoUseFps,
		'use-throttle-fn': DemoUseThrottleFn,
		'use-debounce-fn': DemoUseDebounceFn,
		'use-virtual-list': DemoUseVirtualList,
		'use-clipboard': DemoUseClipboard,
		'use-battery': DemoUseBattery,
		'use-speech-recognition': DemoUseSpeechRecognition,
		'use-scroll-lock': DemoUseScrollLock,
		'use-toggle': DemoUseToggle,
		'use-counter': DemoUseCounter,
		'use-previous': DemoUsePrevious,
		'use-debounce': DemoUseDebounce,
		'use-base64': DemoUseBase64,
		'use-object-url': DemoUseObjectUrl,
		'use-session-storage': DemoUseSessionStorage,
		'use-breakpoints': DemoUseBreakpoints,
		'use-navigator-language': DemoUseNavigatorLanguage,
		'use-browser-location': DemoUseBrowserLocation,
		'use-online': DemoUseOnline,
		'use-page-leave': DemoUsePageLeave,
		'use-local-storage': DemoUseLocalStorage,
		'use-indexed-db': DemoUseIndexedDB,
		'use-click-outside': DemoUseClickOutside,
		'use-drop-zone': DemoUseDropZone,
		'use-element-hover': DemoUseElementHover,
		'use-focus': DemoUseFocus,
		// v1.1.0
		'use-auto-reset-state': DemoUseAutoResetState,
		'use-default-state': DemoUseDefaultState,
		'use-last-changed': DemoUseLastChanged,
		'use-track-history': DemoUseTrackHistory,
		'use-history-state': DemoUseHistoryState,
		'use-watch': DemoUseWatch,
		'use-whenever': DemoUseWhenever,
		'use-async-state': DemoUseAsyncState,
		'use-eye-dropper': DemoUseEyeDropper,
		'use-file-dialog': DemoUseFileDialog,
		'use-share': DemoUseShare,
		'use-vibrate': DemoUseVibrate,
		'use-web-notification': DemoUseWebNotification,
		'use-permission': DemoUsePermission,
		'use-wake-lock': DemoUseWakeLock,
		'use-event-listener': DemoUseEventListener,
		'use-active-element': DemoUseActiveElement,
		'use-document-visibility': DemoUseDocumentVisibility,
		'use-window-focus': DemoUseWindowFocus,
		'use-text-direction': DemoUseTextDirection,
		'use-text-selection': DemoUseTextSelection,
		'use-device-motion': DemoUseDeviceMotion,
		'use-device-orientation': DemoUseDeviceOrientation,
		'use-device-pixel-ratio': DemoUseDevicePixelRatio,
		'use-scrollbar-width': DemoUseScrollbarWidth,
		'use-long-press': DemoUseLongPress,
		'use-start-typing': DemoUseStartTyping,
		'use-swipe': DemoUseSwipe,
		'use-navigation-guard': DemoUseNavigationGuard
	};

	// ── Page data + nav ───────────────────────────────────────────────────────
	let { data }: { data: PageData } = $props();
	const page = $derived(data.page);
	const Demo = $derived(demoMap[page.slug] ?? null);

	const flat = sidebar.flatMap((g) => g.items);
	const currentIndex = $derived(flat.findIndex((i) => i.slug === page.slug));
	const prev = $derived(currentIndex > 0 ? flat[currentIndex - 1] : null);
	const next = $derived(currentIndex < flat.length - 1 ? flat[currentIndex + 1] : null);
</script>

<svelte:head>
	<title>{page.title} — Svelte Use</title>
	<meta name="description" content={page.description} />
	<meta property="og:title" content="{page.title} — Svelte Use" />
	<meta property="og:description" content={page.description} />
	<meta property="og:type" content="article" />
	<meta property="og:url" content={$appPage.url.href} />
	<meta property="og:image" content="{$appPage.url.origin}/logo.svg" />
	<meta property="og:site_name" content="Svelte Use" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="{page.title} — Svelte Use" />
	<meta name="twitter:description" content={page.description} />
	<meta name="twitter:image" content="{$appPage.url.origin}/logo.svg" />
</svelte:head>

<article class="doc">
	<!-- ─── Title ─── -->
	<header class="doc-header">
		<h1 class="doc-title">{page.title}</h1>
		<p class="doc-desc">{page.description}</p>
	</header>

	<!-- ─── Live Demo ─── -->
	{#if Demo}
		<section class="doc-section">
			<h2>Live Demo</h2>
			<div class="demo-panel">
				<Demo />
			</div>
		</section>
	{/if}

	<!-- ─── Usage ─── -->
	<section class="doc-section">
		<h2>Usage</h2>
		<pre class="code-block"><code>{page.usage}</code></pre>
	</section>

	<!-- ─── API: Parameters ─── -->
	{#if page.params && page.params.length > 0}
		<section class="doc-section">
			<h2>Parameters</h2>
			<div class="table-wrap">
				<table>
					<thead>
						<tr>
							<th>Name</th>
							<th>Type</th>
							<th>Default</th>
							<th>Description</th>
						</tr>
					</thead>
					<tbody>
						{#each page.params as row}
							<tr>
								<td><code class="inline-code">{row.name}</code></td>
								<td><code class="inline-code type">{row.type}</code></td>
								<td>
									{#if row.default}
										<code class="inline-code muted">{row.default}</code>
									{:else}
										<span class="muted">—</span>
									{/if}
								</td>
								<td class="desc-cell">{row.description}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>
	{/if}

	<!-- ─── API: Options ─── -->
	{#if page.options && page.options.length > 0}
		<section class="doc-section">
			<h2>Options</h2>
			<div class="table-wrap">
				<table>
					<thead>
						<tr>
							<th>Option</th>
							<th>Type</th>
							<th>Default</th>
							<th>Description</th>
						</tr>
					</thead>
					<tbody>
						{#each page.options as row}
							<tr>
								<td><code class="inline-code">{row.name}</code></td>
								<td><code class="inline-code type">{row.type}</code></td>
								<td>
									{#if row.default}
										<code class="inline-code muted">{row.default}</code>
									{:else}
										<span class="muted">—</span>
									{/if}
								</td>
								<td class="desc-cell">{row.description}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>
	{/if}

	<!-- ─── API: Returns ─── -->
	{#if page.returns && page.returns.length > 0}
		<section class="doc-section">
			<h2>Returns</h2>
			<div class="table-wrap">
				<table>
					<thead>
						<tr>
							<th>Property</th>
							<th>Type</th>
							<th>Description</th>
						</tr>
					</thead>
					<tbody>
						{#each page.returns as row}
							<tr>
								<td><code class="inline-code">{row.name}</code></td>
								<td><code class="inline-code type">{row.type}</code></td>
								<td class="desc-cell">{row.description}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>
	{/if}

	<!-- ─── Example ─── -->
	<section class="doc-section">
		<h2>Example</h2>
		<pre class="code-block"><code>{page.example}</code></pre>
	</section>

	<!-- ─── Notes ─── -->
	{#if page.notes && page.notes.length > 0}
		<section class="doc-section">
			<h2>Notes</h2>
			<ul class="notes-list">
				{#each page.notes as note}
					<li>{@html note}</li>
				{/each}
			</ul>
		</section>
	{/if}

	<!-- ─── Prev / Next ─── -->
	<nav class="page-nav">
		{#if prev}
			<a href="/docs/{prev.slug}" class="page-nav-btn prev">
				<span class="nav-arrow">←</span>
				<span class="nav-info">
					<span class="nav-label">Previous</span>
					<span class="nav-name">{prev.label}</span>
				</span>
			</a>
		{:else}
			<div></div>
		{/if}

		{#if next}
			<a href="/docs/{next.slug}" class="page-nav-btn next">
				<span class="nav-info" style="text-align:right">
					<span class="nav-label">Next</span>
					<span class="nav-name">{next.label}</span>
				</span>
				<span class="nav-arrow">→</span>
			</a>
		{:else}
			<div></div>
		{/if}
	</nav>
</article>

<style>
	.doc {
		max-width: 780px;
	}

	/* ─── Header ─── */
	.doc-header {
		padding-bottom: 2rem;
		border-bottom: 1px solid #1e1e1e;
		margin-bottom: 2rem;
	}

	.doc-title {
		font-size: 2.25rem;
		font-weight: 800;
		margin: 0 0 0.6rem;
		letter-spacing: -0.04em;
		font-family: monospace;
		color: #a78bfa;
	}

	.doc-desc {
		color: #888;
		font-size: 1rem;
		line-height: 1.65;
		margin: 0;
	}

	/* ─── Sections ─── */
	.doc-section {
		margin-bottom: 2.5rem;
	}

	.doc-section h2 {
		font-size: 1.05rem;
		font-weight: 600;
		color: #ccc;
		margin: 0 0 0.9rem;
		padding-bottom: 0.4rem;
		border-bottom: 1px solid #1e1e1e;
		letter-spacing: -0.01em;
	}

	/* ─── Live Demo Panel ─── */
	.demo-panel {
		background: #141414;
		border: 1px solid #2a2a2a;
		border-radius: 10px;
		padding: 1.25rem;
		/* shared demo sub-styles (passed down to demo components) */
	}

	/* Styles shared by all demo components via global cascade */
	:global(.demo-wrap) {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	:global(.demo-wrap .hint) {
		font-size: 0.82rem;
		color: #555;
		margin: 0;
		font-style: italic;
	}

	:global(.demo-wrap .row) {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-size: 0.875rem;
	}

	:global(.demo-wrap .label) {
		font-family: monospace;
		font-size: 0.78rem;
		color: #555;
		min-width: 72px;
		flex-shrink: 0;
	}

	:global(.demo-wrap .value) {
		font-family: monospace;
		color: #999;
	}

	:global(.demo-wrap .value.accent) {
		color: #a78bfa;
	}

	:global(.demo-wrap .muted) {
		color: #444;
		font-size: 0.8rem;
	}

	:global(.demo-wrap .divider) {
		height: 1px;
		background: #222;
		margin: 0.25rem 0;
	}

	:global(.demo-wrap .actions) {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	:global(.demo-wrap button) {
		background: #2a2a2a;
		color: #e8e8e8;
		border: 1px solid #3a3a3a;
		border-radius: 6px;
		padding: 0.3rem 0.7rem;
		font-size: 0.83rem;
		cursor: pointer;
		transition: background 0.15s;
	}

	:global(.demo-wrap button:hover) {
		background: #3a3a3a;
	}

	:global(.demo-wrap button.active) {
		background: #1a1630;
		border-color: #a78bfa;
		color: #a78bfa;
	}

	:global(.demo-wrap input[type='text']) {
		width: 100%;
		background: #1e1e1e;
		border: 1px solid #2e2e2e;
		border-radius: 6px;
		padding: 0.35rem 0.65rem;
		color: #e8e8e8;
		font-size: 0.85rem;
		outline: none;
		box-sizing: border-box;
	}

	:global(.demo-wrap input[type='text']:focus) {
		border-color: #a78bfa;
	}

	/* ─── Code ─── */
	.code-block {
		background: #0d0d0d;
		border: 1px solid #222;
		border-radius: 8px;
		padding: 1.1rem 1.25rem;
		overflow-x: auto;
		margin: 0;
	}

	.code-block code {
		font-family: 'Fira Code', 'Cascadia Code', monospace;
		font-size: 0.82rem;
		color: #a78bfa;
		white-space: pre;
	}

	.inline-code {
		font-family: 'Fira Code', 'Cascadia Code', monospace;
		font-size: 0.8rem;
		background: #1e1e1e;
		padding: 0.15rem 0.4rem;
		border-radius: 4px;
		color: #c4b5fd;
	}

	.inline-code.type {
		color: #7dd3fc;
	}

	.inline-code.muted {
		color: #666;
	}

	/* ─── Tables ─── */
	.table-wrap {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.85rem;
	}

	th {
		text-align: left;
		color: #555;
		font-weight: 600;
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		padding: 0.4rem 0.75rem;
		border-bottom: 1px solid #1e1e1e;
	}

	td {
		padding: 0.55rem 0.75rem;
		border-bottom: 1px solid #161616;
		vertical-align: top;
		color: #bbb;
	}

	tr:last-child td {
		border-bottom: none;
	}

	.muted {
		color: #444;
	}

	.desc-cell {
		color: #999;
		line-height: 1.5;
	}

	/* ─── Notes ─── */
	.notes-list {
		margin: 0;
		padding: 0 0 0 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.notes-list li {
		color: #888;
		font-size: 0.9rem;
		line-height: 1.55;
	}

	:global(.notes-list li code) {
		font-family: 'Fira Code', 'Cascadia Code', monospace;
		font-size: 0.8rem;
		background: #1e1e1e;
		padding: 0.1rem 0.35rem;
		border-radius: 4px;
		color: #c4b5fd;
	}

	/* ─── Prev / Next nav ─── */
	.page-nav {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		margin-top: 3.5rem;
		padding-top: 2rem;
		border-top: 1px solid #1e1e1e;
	}

	.page-nav-btn {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		border: 1px solid #222;
		background: #141414;
		text-decoration: none;
		transition:
			border-color 0.15s,
			background 0.15s;
		min-width: 0;
		max-width: 48%;
	}

	.page-nav-btn:hover {
		border-color: #a78bfa;
		background: #1a1630;
	}

	.nav-arrow {
		color: #555;
		font-size: 1rem;
		flex-shrink: 0;
		transition: color 0.15s;
	}

	.page-nav-btn:hover .nav-arrow {
		color: #a78bfa;
	}

	.nav-info {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		min-width: 0;
	}

	.nav-label {
		font-size: 0.7rem;
		color: #555;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.nav-name {
		font-family: monospace;
		font-size: 0.9rem;
		color: #ccc;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>

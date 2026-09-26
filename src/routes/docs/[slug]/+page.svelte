<script lang="ts">
	import { page as appPage } from '$app/stores';
	import { resolve } from '$app/paths';
	import { findItem, isNew, sidebar } from '../../../docs/sidebar.js';
	import { formatInline, stripInline } from '../../../docs/format.js';
	import type { Component } from 'svelte';
	import type { PageData } from './$types.js';
	// ── Demo components ──────────────────────────────────────────────────────
	import DemoUseColorMode from './demos/use-color-mode.svelte';
	import DemoUseCssVar from './demos/use-css-var.svelte';
	import DemoUseFavicon from './demos/use-favicon.svelte';
	import DemoUsePreferredColorScheme from './demos/use-preferred-color-scheme.svelte';
	import DemoUsePreferredContrast from './demos/use-preferred-contrast.svelte';
	import DemoUsePreferredDark from './demos/use-preferred-dark.svelte';
	import DemoUsePreferredReducedMotion from './demos/use-preferred-reduced-motion.svelte';
	import DemoUseScriptTag from './demos/use-script-tag.svelte';
	import DemoUseStyleTag from './demos/use-style-tag.svelte';
	import DemoUseTitle from './demos/use-title.svelte';
	import DemoUseUrlSearchParams from './demos/use-url-search-params.svelte';
	import DemoUseUserMedia from './demos/use-user-media.svelte';
	import DemoUseFullscreen from './demos/use-fullscreen.svelte';
	import DemoUseScreenOrientation from './demos/use-screen-orientation.svelte';
	import DemoUseGamepad from './demos/use-gamepad.svelte';
	import DemoUseImage from './demos/use-image.svelte';
	import DemoUseSpeechSynthesis from './demos/use-speech-synthesis.svelte';
	import DemoUseFileSystemAccess from './demos/use-file-system-access.svelte';
	import DemoUseEventSource from './demos/use-event-source.svelte';
	import DemoUseBroadcastChannel from './demos/use-broadcast-channel.svelte';
	import DemoUseWebWorkerFn from './demos/use-web-worker-fn.svelte';
	import DemoUseDisplayMedia from './demos/use-display-media.svelte';
	import DemoUseDevicesList from './demos/use-devices-list.svelte';
	import DemoUseAnimate from './demos/use-animate.svelte';
	import DemoUseElementBounding from './demos/use-element-bounding.svelte';
	import DemoUseInfiniteScroll from './demos/use-infinite-scroll.svelte';
	import DemoUseMediaQuery from './demos/use-media-query.svelte';
	import DemoUseMouseInElement from './demos/use-mouse-in-element.svelte';
	import DemoUseTextareaAutosize from './demos/use-textarea-autosize.svelte';
	import DemoUseWindowSize from './demos/use-window-size.svelte';
	import DemoUseRafFn from './demos/use-raf-fn.svelte';
	import DemoUseStorage from './demos/use-storage.svelte';
	import DemoUseSupported from './demos/use-supported.svelte';
	import DemoUseUntil from './demos/use-until.svelte';
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
	const demoMap: Record<string, Component> = {
		'use-color-mode': DemoUseColorMode,
		'use-css-var': DemoUseCssVar,
		'use-favicon': DemoUseFavicon,
		'use-preferred-color-scheme': DemoUsePreferredColorScheme,
		'use-preferred-contrast': DemoUsePreferredContrast,
		'use-preferred-dark': DemoUsePreferredDark,
		'use-preferred-reduced-motion': DemoUsePreferredReducedMotion,
		'use-script-tag': DemoUseScriptTag,
		'use-style-tag': DemoUseStyleTag,
		'use-title': DemoUseTitle,
		'use-url-search-params': DemoUseUrlSearchParams,
		'use-user-media': DemoUseUserMedia,
		'use-fullscreen': DemoUseFullscreen,
		'use-screen-orientation': DemoUseScreenOrientation,
		'use-gamepad': DemoUseGamepad,
		'use-image': DemoUseImage,
		'use-speech-synthesis': DemoUseSpeechSynthesis,
		'use-file-system-access': DemoUseFileSystemAccess,
		'use-event-source': DemoUseEventSource,
		'use-broadcast-channel': DemoUseBroadcastChannel,
		'use-web-worker-fn': DemoUseWebWorkerFn,
		'use-display-media': DemoUseDisplayMedia,
		'use-devices-list': DemoUseDevicesList,
		'use-animate': DemoUseAnimate,
		'use-element-bounding': DemoUseElementBounding,
		'use-infinite-scroll': DemoUseInfiniteScroll,
		'use-media-query': DemoUseMediaQuery,
		'use-mouse-in-element': DemoUseMouseInElement,
		'use-textarea-autosize': DemoUseTextareaAutosize,
		'use-window-size': DemoUseWindowSize,
		'use-raf-fn': DemoUseRafFn,
		'use-storage': DemoUseStorage,
		'use-supported': DemoUseSupported,
		'use-until': DemoUseUntil,
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

	// `since` lives on the sidebar entry, so it is read from there rather than
	// duplicated into pages.ts. Utils predating version tracking have none, and
	// correctly show no badge.
	const entry = $derived(findItem(page.slug));
	const since = $derived(entry?.since);
	const isNewInThisRelease = $derived(entry ? isNew(entry) : false);

	const flat = sidebar.flatMap((g) => g.items);
	const currentIndex = $derived(flat.findIndex((i) => i.slug === page.slug));
	const prev = $derived(currentIndex > 0 ? flat[currentIndex - 1] : null);
	const next = $derived(currentIndex < flat.length - 1 ? flat[currentIndex + 1] : null);

	// Meta tags take the marker-free form — markup would leak into search
	// results and link previews.
	const metaDescription = $derived(stripInline(page.description));

	// ── Shared class strings ──────────────────────────────────────────────────
	// Repeated across several sections; named here rather than pasted inline so
	// a change lands in one place.
	const sectionHeading =
		'text-text-dim border-border m-0 mb-3.5 border-b pb-1.5 text-[1.05rem] font-semibold tracking-tight';
	const codeBlock = 'bg-bg-sunken border-border m-0 overflow-x-auto rounded-lg border px-5 py-4.5';
	const codeText =
		"text-accent font-['Fira_Code','Cascadia_Code',monospace] text-[0.82rem] whitespace-pre";
	const tableHead =
		'text-text-faint border-border border-b px-3 py-1.5 text-left text-[0.75rem] font-semibold tracking-wider uppercase';
	const tableCell = 'border-border/60 text-text-dim border-b px-3 py-2.5 align-top';
	const descCell = 'text-text-muted leading-normal';
	const navBtn =
		'bg-bg-elev border-border hover:border-accent hover:bg-accent-bg flex max-w-[48%] min-w-0 items-center gap-3 rounded-lg border px-4 py-3 no-underline transition-colors';
	const navArrow = 'text-text-faint shrink-0 text-base transition-colors';
	const navKicker = 'text-text-faint text-[0.7rem] tracking-wider uppercase';
	const navName = 'text-text truncate font-mono text-[0.9rem]';
</script>

<svelte:head>
	<title>{page.title} — Svelte Use</title>
	<meta name="description" content={metaDescription} />
	<meta property="og:title" content="{page.title} — Svelte Use" />
	<meta property="og:description" content={metaDescription} />
	<meta property="og:type" content="article" />
	<meta property="og:url" content={$appPage.url.href} />
	<meta property="og:image" content="{$appPage.url.origin}/logo.svg" />
	<meta property="og:site_name" content="Svelte Use" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="{page.title} — Svelte Use" />
	<meta name="twitter:description" content={metaDescription} />
	<meta name="twitter:image" content="{$appPage.url.origin}/logo.svg" />
</svelte:head>

<article class="max-w-[780px]">
	<!-- ─── Title ─── -->
	<header class="border-border mb-8 border-b pb-8">
		<div class="mb-2.5 flex flex-wrap items-center gap-3">
			<h1 class="text-accent m-0 font-mono text-[2.25rem] font-extrabold tracking-[-0.04em]">
				{page.title}
			</h1>
			{#if since}
				<!--
					Outside the <h1> on purpose: the heading text is what feeds the
					document outline, and "useColorMode v1.2.0" would read oddly there.
					The title attribute carries the same information for a pointer user.
				-->
				<span
					class="shrink-0 rounded-full border px-2.5 py-1 font-sans text-[0.7rem] leading-none font-semibold tracking-wide {isNewInThisRelease
						? 'text-accent-strong bg-accent-bg border-accent-border'
						: 'text-text-muted bg-surface border-border'}"
					title={isNewInThisRelease
						? `Added in v${since}, the current release`
						: `Added in v${since}`}
				>
					{isNewInThisRelease ? `New in v${since}` : `v${since}`}
				</span>
			{/if}
		</div>
		<p class="doc-prose text-text-muted m-0 text-base leading-relaxed">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- formatInline() escapes HTML before emitting tags, and the source is repo-authored doc copy, not user input -->
			{@html formatInline(page.description)}
		</p>
	</header>

	<!-- ─── Live Demo ─── -->
	{#if Demo}
		<section class="mb-10">
			<h2 class={sectionHeading}>Live Demo</h2>
			<div class="bg-bg-elev border-border rounded-[10px] border p-5">
				<Demo />
			</div>
		</section>
	{/if}

	<!-- ─── Usage ─── -->
	<section class="mb-10">
		<h2 class={sectionHeading}>Usage</h2>
		<pre class={codeBlock}><code class={codeText}>{page.usage}</code></pre>
	</section>

	<!-- ─── API: Parameters ─── -->
	{#if page.params && page.params.length > 0}
		<section class="mb-10">
			<h2 class={sectionHeading}>Parameters</h2>
			<div class="overflow-x-auto">
				<table class="w-full border-collapse text-[0.85rem]">
					<thead>
						<tr>
							<th class={tableHead}>Name</th>
							<th class={tableHead}>Type</th>
							<th class={tableHead}>Default</th>
							<th class={tableHead}>Description</th>
						</tr>
					</thead>
					<tbody>
						{#each page.params as row (row.name)}
							<tr>
								<td class={tableCell}><code class="inline-code">{row.name}</code></td>
								<td class={tableCell}><code class="inline-code type">{row.type}</code></td>
								<td class={tableCell}>
									{#if row.default}
										<code class="inline-code muted">{row.default}</code>
									{:else}
										<span class="text-text-faint">—</span>
									{/if}
								</td>
								<!-- eslint-disable-next-line svelte/no-at-html-tags -- formatInline() escapes HTML before emitting tags -->
								<td class="{tableCell} {descCell}">{@html formatInline(row.description)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>
	{/if}

	<!-- ─── API: Options ─── -->
	{#if page.options && page.options.length > 0}
		<section class="mb-10">
			<h2 class={sectionHeading}>Options</h2>
			<div class="overflow-x-auto">
				<table class="w-full border-collapse text-[0.85rem]">
					<thead>
						<tr>
							<th class={tableHead}>Option</th>
							<th class={tableHead}>Type</th>
							<th class={tableHead}>Default</th>
							<th class={tableHead}>Description</th>
						</tr>
					</thead>
					<tbody>
						{#each page.options as row (row.name)}
							<tr>
								<td class={tableCell}><code class="inline-code">{row.name}</code></td>
								<td class={tableCell}><code class="inline-code type">{row.type}</code></td>
								<td class={tableCell}>
									{#if row.default}
										<code class="inline-code muted">{row.default}</code>
									{:else}
										<span class="text-text-faint">—</span>
									{/if}
								</td>
								<!-- eslint-disable-next-line svelte/no-at-html-tags -- formatInline() escapes HTML before emitting tags -->
								<td class="{tableCell} {descCell}">{@html formatInline(row.description)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>
	{/if}

	<!-- ─── API: Returns ─── -->
	{#if page.returns && page.returns.length > 0}
		<section class="mb-10">
			<h2 class={sectionHeading}>Returns</h2>
			<div class="overflow-x-auto">
				<table class="w-full border-collapse text-[0.85rem]">
					<thead>
						<tr>
							<th class={tableHead}>Property</th>
							<th class={tableHead}>Type</th>
							<th class={tableHead}>Description</th>
						</tr>
					</thead>
					<tbody>
						{#each page.returns as row (row.name)}
							<tr>
								<td class={tableCell}><code class="inline-code">{row.name}</code></td>
								<td class={tableCell}><code class="inline-code type">{row.type}</code></td>
								<!-- eslint-disable-next-line svelte/no-at-html-tags -- formatInline() escapes HTML before emitting tags -->
								<td class="{tableCell} {descCell}">{@html formatInline(row.description)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>
	{/if}

	<!-- ─── Example ─── -->
	<section class="mb-10">
		<h2 class={sectionHeading}>Example</h2>
		<pre class={codeBlock}><code class={codeText}>{page.example}</code></pre>
	</section>

	<!-- ─── Notes ─── -->
	{#if page.notes && page.notes.length > 0}
		<section class="mb-10">
			<h2 class={sectionHeading}>Notes</h2>
			<ul class="m-0 flex list-disc flex-col gap-2 py-0 pr-0 pl-5">
				{#each page.notes as note (note)}
					<li class="doc-prose text-text-muted text-[0.9rem] leading-relaxed">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- formatInline() escapes HTML before emitting tags -->
						{@html formatInline(note)}
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	<!-- ─── Prev / Next ─── -->
	<nav class="border-border mt-14 flex justify-between gap-4 border-t pt-8">
		{#if prev}
			<a href={resolve('/docs/[slug]', { slug: prev.slug })} class="group {navBtn}">
				<span class="{navArrow} group-hover:text-accent">←</span>
				<span class="flex min-w-0 flex-col gap-[0.1rem]">
					<span class={navKicker}>Previous</span>
					<span class={navName}>{prev.label}</span>
				</span>
			</a>
		{:else}
			<div></div>
		{/if}

		{#if next}
			<a href={resolve('/docs/[slug]', { slug: next.slug })} class="group {navBtn}">
				<span class="flex min-w-0 flex-col gap-[0.1rem] text-right">
					<span class={navKicker}>Next</span>
					<span class={navName}>{next.label}</span>
				</span>
				<span class="{navArrow} group-hover:text-accent">→</span>
			</a>
		{:else}
			<div></div>
		{/if}
	</nav>
</article>

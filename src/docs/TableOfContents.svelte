<!--
	@component
	The sticky "On this page" rail, shared by the docs pages and the homepage.
-->
<script lang="ts">
	import { useEventListener } from '$lib';

	/** One linkable section. `id` must match an element id on the page. */
	export interface TocEntry {
		id: string;
		label: string;
	}

	let { entries }: { entries: readonly TocEntry[] } = $props();

	let activeId = $state<string | null>(null);
	let railEl = $state<HTMLElement | null>(null);
	let disclosureEl = $state<HTMLDetailsElement | null>(null);

	/*
	 * These are same-page anchors, so tapping one navigates nowhere and the disclosure would stay
	 * open — covering the very section it just jumped to.
	 */
	function closeDisclosure() {
		if (disclosureEl) disclosureEl.open = false;
	}

	/** Matches the `scroll-mt-24` the caller puts on each section. */
	const SPY_LINE = 96;

	function syncActive() {
		/*
		 * The rail is `display: none` below `xl`, which makes `offsetParent` null — so phones and
		 * tablets skip the measuring loop entirely and the scroll listener costs one property read.
		 */
		if (!railEl || railEl.offsetParent === null) return;

		const ids = entries.map((entry) => entry.id);
		let current = ids[0] ?? null;

		for (const id of ids) {
			const element = document.getElementById(id);
			if (element && element.getBoundingClientRect().top <= SPY_LINE) current = id;
		}

		// At the very bottom the last section may never cross the spy line, so
		// without this it could never become active.
		const atBottom =
			window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
		if (atBottom) current = ids.at(-1) ?? current;

		// Deliberately never *reads* `activeId`: assigning an unchanged value is a no-op in Svelte 5,
		// and a `current !== activeId` guard would make the effect below depend on the state it writes.
		activeId = current;
	}

	// A getter, not a bare `window`: the argument is evaluated at call time,
	// which happens during SSR too, where the identifier would throw.
	useEventListener(() => globalThis.window, ['scroll', 'resize'], syncActive, { passive: true });

	// First paint, and a resync when the entry list itself changes — that is, on navigation to
	// another page.
	$effect(() => {
		syncActive();
	});
</script>

{#snippet links(compact: boolean)}
	<ul class="border-border m-0 flex list-none flex-col border-l p-0">
		{#each entries as entry (entry.id)}
			<li>
				<a
					href="#{entry.id}"
					onclick={compact ? closeDisclosure : undefined}
					aria-current={!compact && activeId === entry.id ? 'location' : undefined}
					class="-ml-px block border-l py-1.5 pl-3 text-[0.82rem] no-underline transition-colors {!compact &&
					activeId === entry.id
						? 'border-accent text-accent'
						: 'border-transparent text-text-muted hover:border-border-strong hover:text-text'}"
				>
					{entry.label}
				</a>
			</li>
		{/each}
	</ul>
{/snippet}

<!--
	Below `xl`. A native <details>, not a scripted dropdown: it works without JavaScript,
	is keyboard accessible for free, and starts collapsed to cost one line on a phone.
-->
<!--
	Sticky below the fixed mobile top bar, which measures 53px.
-->
<div class="bg-bg sticky top-[53px] z-50 mb-2 pt-2 pb-1 xl:hidden">
	<details bind:this={disclosureEl} class="group border-border rounded-lg border px-4 py-2">
		<!--
			`list-none` hides the marker in Chrome and Firefox; Safari needs the
			`::-webkit-details-marker` rule as well.
		-->
		<summary
			class="text-text-muted hover:text-text flex cursor-pointer list-none items-center justify-between gap-2 text-[0.78rem] font-semibold tracking-[0.08em] uppercase [&::-webkit-details-marker]:hidden"
		>
			On this page
			<svg
				class="shrink-0 transition-transform duration-200 group-open:rotate-180"
				width="14"
				height="14"
				viewBox="0 0 20 20"
				fill="none"
				aria-hidden="true"
			>
				<path d="M5 8l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
			</svg>
		</summary>
		<nav aria-label="On this page" class="mt-2 max-h-[50vh] overflow-y-auto">
			{@render links(true)}
		</nav>
	</details>
</div>

<aside
	bind:this={railEl}
	class="sticky top-12 hidden max-h-[calc(100vh-7rem)] w-[208px] shrink-0 self-start overflow-y-auto xl:order-last xl:block"
>
	<!--
		A <p>, not a heading: the page's real h2s are the section titles, and an "On this page"
		heading would inject navigation into the document outline.
	-->
	<p class="text-text-faint m-0 mb-3 text-[0.72rem] font-semibold tracking-[0.08em] uppercase">
		On this page
	</p>
	<nav aria-label="On this page">
		{@render links(false)}
	</nav>
</aside>

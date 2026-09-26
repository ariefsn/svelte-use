<script lang="ts">
	import { useBrowserLocation } from '$lib';

	const loc = useBrowserLocation();
</script>

<div class="demo-wrap">
	<p class="hint">Navigate, use browser back/forward, or change the URL hash to see updates.</p>

	<div class="flex flex-col gap-1.5">
		<div class="flex items-baseline gap-3 text-[0.88rem]">
			<span class="text-text-muted min-w-[72px] shrink-0 font-mono">pathname</span>
			<span class="text-accent font-mono break-all">{loc.pathname()}</span>
		</div>
		<div class="flex items-baseline gap-3 text-[0.88rem]">
			<span class="text-text-muted min-w-[72px] shrink-0 font-mono">search</span>
			<span class="text-accent font-mono break-all">{loc.search() || '—'}</span>
		</div>
		<div class="flex items-baseline gap-3 text-[0.88rem]">
			<span class="text-text-muted min-w-[72px] shrink-0 font-mono">hash</span>
			<span class="text-accent font-mono break-all">{loc.hash() || '—'}</span>
		</div>
		<div class="flex items-baseline gap-3 text-[0.88rem]">
			<span class="text-text-muted min-w-[72px] shrink-0 font-mono">href</span>
			<span class="val href">{loc.href()}</span>
		</div>
	</div>

	<div class="actions">
		<a
			href="#section-1"
			class="bg-surface-2 text-text border-border-strong hover:bg-surface-3 rounded-md border px-2.5 py-1.5 text-[0.82rem] no-underline transition-colors"
			>Set #section-1</a
		>
		<a
			href="#section-2"
			class="bg-surface-2 text-text border-border-strong hover:bg-surface-3 rounded-md border px-2.5 py-1.5 text-[0.82rem] no-underline transition-colors"
			>Set #section-2</a
		>
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- runtime pathname from useBrowserLocation; not a static route id -->
		<a href={loc.pathname()}>Clear hash</a>
	</div>
</div>

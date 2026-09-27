<script lang="ts">
	import { useFavicon } from '$lib';

	const icons = [
		{ label: 'default', href: '/logo.svg' },
		{
			label: 'data URI (green)',
			href: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"%3E%3Ccircle cx="8" cy="8" r="7" fill="%234ade80"/%3E%3C/svg%3E'
		},
		{
			label: 'data URI (red)',
			href: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"%3E%3Ccircle cx="8" cy="8" r="7" fill="%23f87171"/%3E%3C/svg%3E'
		}
	];

	let selected = $state(icons[0].href);
	const favicon = useFavicon(() => selected);
</script>

<div class="demo-wrap">
	<div class="actions">
		{#each icons as icon (icon.href)}
			<button class:active={selected === icon.href} onclick={() => (selected = icon.href)}>
				{icon.label}
			</button>
		{/each}
	</div>

	<div class="row">
		<span class="label">href</span>
		<span class="value accent">{favicon.current()?.slice(0, 40) ?? '(none)'}</span>
	</div>

	<p class="hint">
		Watch the tab icon. This adopts the page's existing <code>&lt;link rel="icon"&gt;</code> rather than
		appending a second one — browsers pick unpredictably among duplicates — and restores the original
		href when the page unmounts.
	</p>
</div>

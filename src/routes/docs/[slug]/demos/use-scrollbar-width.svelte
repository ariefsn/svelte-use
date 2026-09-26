<script lang="ts">
	import { useScrollbarWidth } from '$lib/browser/useScrollbarWidth.svelte.js';
	let el = $state<HTMLDivElement | null>(null);
	const { x, y } = useScrollbarWidth(() => el);
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">scrollbar width (y)</span>
		<span class="value accent">{y()}px</span>
	</div>
	<div class="row">
		<span class="label">scrollbar height (x)</span>
		<span class="value accent">{x()}px</span>
	</div>
	<div bind:this={el} class="bg-bg border-border-strong h-[100px] overflow-auto rounded border p-2">
		<div class="text-text-muted h-[300px]">
			Scroll this content to see the scrollbar. The scrollbar width is measured automatically.
		</div>
	</div>
	<p class="hint">Measures the scrollbar width of the scrollable container above.</p>
</div>

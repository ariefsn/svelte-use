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
	<div bind:this={el} style="height:100px;overflow:auto;background:#111;border:1px solid #333;border-radius:4px;padding:0.5rem">
		<div style="height:300px;color:#888">Scroll this content to see the scrollbar. The scrollbar width is measured automatically.</div>
	</div>
	<p class="hint">Measures the scrollbar width of the scrollable container above.</p>
</div>

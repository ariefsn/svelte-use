<script lang="ts">
	import { useMediaQuery } from '$lib';

	const isWide = useMediaQuery('(min-width: 768px)');
	const isDark = useMediaQuery('(prefers-color-scheme: dark)');
	const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

	let width = $state(1000);
	const custom = useMediaQuery(() => `(min-width: ${width}px)`);
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">(min-width: 768px)</span>
		<span class="value accent">{isWide()}</span>
	</div>
	<div class="row">
		<span class="label">(prefers-color-scheme: dark)</span>
		<span class="value accent">{isDark()}</span>
	</div>
	<div class="row">
		<span class="label">(prefers-reduced-motion: reduce)</span>
		<span class="value accent">{reducedMotion()}</span>
	</div>

	<hr class="border-border my-1.5 border-0 border-t" />

	<div class="row gap-3">
		<span class="label">reactive query</span>
		<input type="range" min="320" max="2000" step="20" bind:value={width} class="flex-1" />
		<span class="value accent">{custom()}</span>
	</div>
	<p class="hint">
		Drag the slider to rebuild the query as <code>(min-width: {width}px)</code>, or resize the
		window to watch the fixed queries flip.
	</p>
</div>

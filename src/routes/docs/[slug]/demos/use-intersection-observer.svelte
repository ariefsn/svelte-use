<script lang="ts">
	import { useIntersectionObserver } from '$lib/browser/useIntersectionObserver.svelte.js';

	let target: HTMLElement;
	const { isIntersecting, entry } = useIntersectionObserver(() => target, { threshold: 0.5 });
</script>

<div class="demo-wrap" style="gap:0.75rem">
	<p class="hint">Scroll the box below — the element triggers at 50% visibility.</p>

	<div
		class="bg-bg border-border flex h-[150px] flex-col items-center overflow-y-auto rounded-lg border"
	>
		<div class="text-text-faint flex h-[100px] items-center text-[0.8rem]">↓ scroll down ↓</div>
		<div
			bind:this={target}
			class="rounded-lg border border-dashed px-6 py-3 text-[0.9rem] whitespace-nowrap transition-all duration-200 {isIntersecting()
				? 'border-accent text-accent bg-accent-bg'
				: 'border-border-strong text-text-faint'}"
		>
			{isIntersecting() ? '✓ Intersecting' : '○ Not visible'}
		</div>
		<div class="text-text-faint flex h-[100px] items-center text-[0.8rem]">↑ scroll up ↑</div>
	</div>

	<div class="row">
		<span class="label">ratio</span>
		<span class="value accent">{((entry()?.intersectionRatio ?? 0) * 100).toFixed(0)}%</span>
	</div>
</div>

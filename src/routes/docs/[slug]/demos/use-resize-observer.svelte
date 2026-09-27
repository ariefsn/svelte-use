<script lang="ts">
	import { useResizeObserver } from '$lib/browser/useResizeObserver.svelte.js';

	let box: HTMLElement;
	let w = $state(0);
	let h = $state(0);
	let count = $state(0);

	useResizeObserver(
		() => box,
		(entry) => {
			w = Math.round(entry.contentRect.width);
			h = Math.round(entry.contentRect.height);
			count++;
		}
	);
</script>

<div class="demo-wrap">
	<p class="hint">Resize the box — the callback fires on every size change.</p>

	<div
		class="bg-bg border-border h-[120px] max-w-full min-h-[60px] min-w-[80px] w-[240px] resize overflow-auto rounded-lg border"
		bind:this={box}
	>
		<div class="pointer-events-none flex h-full flex-col items-center justify-center gap-1">
			<span class="text-accent font-mono text-base font-semibold">{w} × {h}</span>
			<span class="text-text-faint text-[0.75rem]">fires: {count}</span>
		</div>
	</div>
</div>

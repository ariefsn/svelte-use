<script lang="ts">
	import { useElementSize } from '$lib/browser/useElementSize.svelte.js';

	let box: HTMLElement;
	const size = useElementSize(() => box);
</script>

<div class="demo-wrap">
	<p class="hint">Resize the box using the handle at the bottom-right corner.</p>

	<div
		class="bg-accent-bg border-accent/40 flex h-[120px] max-w-full min-h-[60px] min-w-[80px] w-[240px] resize items-center justify-center overflow-auto rounded-lg border"
		bind:this={box}
	>
		<span class="text-accent pointer-events-none font-mono text-[1.1rem] font-semibold"
			>{size.width()} × {size.height()}</span
		>
	</div>
</div>

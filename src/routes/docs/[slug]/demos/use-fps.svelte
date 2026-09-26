<script lang="ts">
	import { useFps } from '$lib/performance/useFps.svelte.js';

	const fps = useFps();

	// Token references, so the thresholds stay legible in both themes.
	const color = $derived(
		fps() >= 55
			? 'var(--color-success)'
			: fps() >= 30
				? 'var(--color-warning)'
				: 'var(--color-danger)'
	);
</script>

<div class="demo-wrap">
	<p class="hint">Current frame rate of the browser rendering loop.</p>

	<div class="my-2 flex items-baseline gap-1.5">
		<span
			class="text-[3.5rem] leading-none font-extrabold tabular-nums transition-colors duration-500"
			style="color:{color}">{fps()}</span
		>
		<span class="text-text-faint text-base">fps</span>
	</div>

	<div class="bg-surface h-1.5 w-full overflow-hidden rounded-full">
		<div
			class="h-full rounded-full transition-[width,background] duration-300"
			style="width:{(Math.min(fps(), 60) / 60) * 100}%; background:{color}"
		></div>
	</div>

	<div class="text-text-faint mt-1 flex justify-between text-[0.7rem]">
		<span>0</span><span>30</span><span>60</span>
	</div>
</div>

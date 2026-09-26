<script lang="ts">
	import { useCountdown } from '$lib/state/useCountdown.svelte.js';

	const timer = useCountdown(30);

	const pct = $derived(Math.round((timer.count() / 30) * 100));
</script>

<div class="demo-wrap">
	<div class="text-accent mb-4 text-[3.5rem] leading-none font-extrabold tabular-nums">
		{timer.count()}
	</div>

	<div class="bg-surface-2 mb-4 h-1.5 w-full overflow-hidden rounded-full">
		<div
			class="bg-accent h-full rounded-full transition-[width] duration-900 ease-linear"
			style="width:{pct}%"
		></div>
	</div>

	<div class="actions">
		{#if timer.isActive()}
			<button onclick={() => timer.stop()}>Pause</button>
		{:else}
			<button onclick={() => timer.start()}>
				{timer.count() === 0 ? 'Restart' : 'Start'}
			</button>
		{/if}
		<button onclick={() => timer.reset()}>Reset</button>
	</div>
</div>

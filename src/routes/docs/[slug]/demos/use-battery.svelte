<script lang="ts">
	import { useBattery } from '$lib/browser/useBattery.svelte.js';

	const battery = useBattery();
	const pct = $derived(Math.round(battery.level() * 100));
	// Token references, so the thresholds read correctly in both themes.
	const color = $derived(
		pct > 50 ? 'var(--color-success)' : pct > 20 ? 'var(--color-warning)' : 'var(--color-danger)'
	);
</script>

<div class="demo-wrap">
	<p class="hint">Shows live battery status from the Battery Status API.</p>

	<div class="bg-bg border-border flex items-center gap-4 rounded-lg border p-4">
		<div
			class="border-text-faint relative flex h-9 w-20 items-center overflow-visible rounded border-2"
		>
			<div
				class="h-full rounded-[2px] transition-[width,background] duration-500"
				style="width:{pct}%; background:{color}"
			></div>
			<div
				class="bg-text-faint absolute top-1/2 -right-1.5 h-3.5 w-1 -translate-y-1/2 rounded-r-[2px]"
			></div>
		</div>

		<div class="flex flex-col gap-[0.15rem]">
			<span class="text-[1.4rem] font-bold transition-colors duration-500" style="color:{color}"
				>{pct}%</span
			>
			<span class="text-text-faint text-[0.8rem]"
				>{battery.charging() ? '⚡ Charging' : '🔋 On battery'}</span
			>
		</div>
	</div>

	<div class="row">
		<span class="label">level</span>
		<span class="value accent">{battery.level().toFixed(2)}</span>
	</div>
	<div class="row">
		<span class="label">charging</span>
		<span class="value accent">{battery.charging()}</span>
	</div>
</div>

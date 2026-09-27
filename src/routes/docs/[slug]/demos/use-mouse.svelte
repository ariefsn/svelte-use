<script lang="ts">
	import { useMouse } from '$lib/browser/useMouse.svelte.js';

	const mouse = useMouse();
</script>

<div class="demo-wrap">
	<p class="hint">Move your mouse over the page — position updates in real time.</p>

	<div class="bg-bg border-border flex items-center justify-between rounded-lg border p-6">
		<div class="flex gap-6">
			<div class="flex flex-col items-center gap-0.5">
				<span class="text-text-faint text-[0.7rem] tracking-[0.06em] uppercase">X</span>
				<span class="text-accent text-[1.6rem] font-bold tabular-nums">{mouse.x()}</span>
			</div>
			<div class="flex flex-col items-center gap-0.5">
				<span class="text-text-faint text-[0.7rem] tracking-[0.06em] uppercase">Y</span>
				<span class="text-accent text-[1.6rem] font-bold tabular-nums">{mouse.y()}</span>
			</div>
		</div>
		<div
			class="bg-accent-bg text-accent border-accent-border rounded-full border px-2.5 py-1 font-mono text-[0.8rem]"
		>
			{mouse.sourceType() ?? 'none'}
		</div>
	</div>
</div>

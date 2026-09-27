<script lang="ts">
	import { useThrottleFn } from '$lib/performance/useThrottleFn.svelte.js';

	let rawCount = $state(0);
	let throttledCount = $state(0);
	let lastFired = $state<string>('—');

	const throttled = useThrottleFn(() => {
		throttledCount++;
		lastFired = new Date().toLocaleTimeString('en', {
			hour12: false,
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	}, 500);

	function trigger() {
		rawCount++;
		throttled();
	}
</script>

<div class="demo-wrap">
	<p class="hint">Click rapidly — the throttled function fires at most once per 500ms.</p>

	<button
		class="bg-accent-bg text-accent border-accent/40 hover:border-accent w-full cursor-pointer rounded-lg border p-2.5 text-[0.95rem] transition-all duration-150 active:scale-[0.98]"
		onclick={trigger}>Click me fast!</button
	>

	<div class="grid grid-cols-2 gap-2">
		<div class="bg-bg border-border flex flex-col gap-0.5 rounded-lg border px-3 py-2.5">
			<span class="text-text-faint text-[0.7rem] tracking-wide uppercase">raw calls</span>
			<span class="text-text-muted text-[1.4rem] font-bold tabular-nums">{rawCount}</span>
		</div>
		<div class="bg-accent-bg border-accent/30 flex flex-col gap-0.5 rounded-lg border px-3 py-2.5">
			<span class="text-text-faint text-[0.7rem] tracking-wide uppercase">throttled fires</span>
			<span class="text-accent text-[1.4rem] font-bold tabular-nums">{throttledCount}</span>
		</div>
	</div>

	<div class="row">
		<span class="label">last fired</span><span class="value accent">{lastFired}</span>
	</div>
</div>

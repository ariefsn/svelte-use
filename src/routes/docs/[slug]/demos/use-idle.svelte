<script lang="ts">
	import { useIdle } from '$lib/performance/useIdle.svelte.js';

	const isIdle = useIdle(3000); // 3 seconds

	let lastActive = $state(new Date());
	$effect(() => {
		if (!isIdle()) lastActive = new Date();
	});
</script>

<div class="demo-wrap">
	<p class="hint">Stop moving the mouse and pressing keys for 3 seconds.</p>

	<div
		class="flex items-center gap-3 rounded-lg border px-5 py-4 transition-all duration-300 {isIdle()
			? 'border-danger bg-danger-bg'
			: 'border-border bg-surface'}"
	>
		<div
			class="h-2.5 w-2.5 shrink-0 rounded-full transition-colors duration-300 {isIdle()
				? 'bg-border-strong'
				: 'bg-success animate-pulse'}"
		></div>
		<div class="flex flex-col gap-[0.1rem]">
			<span class="text-[0.9rem] {isIdle() ? 'text-danger' : 'text-text-dim'}"
				>{isIdle() ? 'User is idle' : 'User is active'}</span
			>
			<span class="text-text-faint text-[0.75rem]"
				>Last activity: {lastActive.toLocaleTimeString()}</span
			>
		</div>
	</div>
</div>

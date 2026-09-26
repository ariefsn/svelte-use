<script lang="ts">
	import { untrack } from 'svelte';
	import { usePageLeave } from '$lib';

	const hasLeft = usePageLeave();
	let leaveCount = $state(0);

	// `leaveCount++` reads and writes the same $state, so it must be untracked —
	// otherwise the effect depends on what it writes and loops until Svelte
	// throws effect_update_depth_exceeded.
	$effect(() => {
		if (hasLeft()) {
			untrack(() => {
				leaveCount++;
			});
		}
	});
</script>

<div class="demo-wrap">
	<div
		class="flex w-fit items-center gap-2.5 rounded-lg border px-4 py-3 text-[0.9rem] font-medium transition-all duration-200 {hasLeft()
			? 'border-warning-border bg-warning-bg text-warning'
			: 'border-success-border bg-success-bg text-success'}"
	>
		<span
			class="h-2.5 w-2.5 shrink-0 rounded-full transition-colors duration-200 {hasLeft()
				? 'bg-warning'
				: 'bg-success'}"
		></span>
		<span>{hasLeft() ? 'Cursor left the viewport' : 'Cursor inside viewport'}</span>
	</div>

	<div class="flex items-center gap-3 text-[0.88rem]">
		<span class="text-text-muted font-mono">leave count</span>
		<span class="text-accent font-mono font-semibold">{leaveCount}</span>
	</div>

	<p class="hint">Move your cursor out of the browser window to trigger the state change.</p>
</div>

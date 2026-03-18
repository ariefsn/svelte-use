<script lang="ts">
	import { useTrackHistory } from '$lib/state/useTrackHistory.svelte.js';
	let count = $state(0);
	const tracker = useTrackHistory(
		() => count,
		(v) => (count = v)
	);
</script>
<div class="demo-wrap">
	<div class="row">
		<span class="label">count</span>
		<span class="value accent">{count}</span>
	</div>
	<div class="row">
		<span class="label">history length</span>
		<span class="value accent">{tracker.history().length}</span>
	</div>
	<div class="actions">
		<button onclick={() => count++}>Increment</button>
		<button onclick={tracker.undo} disabled={!tracker.canUndo()}>Undo</button>
		<button onclick={tracker.redo} disabled={!tracker.canRedo()}>Redo</button>
	</div>
	<p class="hint">Click increment then use undo/redo to navigate history.</p>
</div>

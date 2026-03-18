<script lang="ts">
	import { useHistoryState } from '$lib/state/useHistoryState.svelte.js';
	const state = useHistoryState(0);
</script>
<div class="demo-wrap">
	<div class="row">
		<span class="label">value</span>
		<span class="value accent">{state.value}</span>
	</div>
	<div class="actions">
		<button onclick={() => state.value++}>Increment</button>
		<button onclick={() => state.value--}>Decrement</button>
		<button onclick={state.undo} disabled={!state.canUndo()}>Undo</button>
		<button onclick={state.redo} disabled={!state.canRedo()}>Redo</button>
	</div>
	<p class="hint">State with built-in undo/redo history.</p>
</div>

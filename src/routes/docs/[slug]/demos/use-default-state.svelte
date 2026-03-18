<script lang="ts">
	import { useDefaultState } from '$lib/state/useDefaultState.svelte.js';
	const name = useDefaultState('Anonymous');
	let input = $state('');
</script>
<div class="demo-wrap">
	<div class="row">
		<span class="label">value</span>
		<span class="value accent">{name.value}</span>
	</div>
	<input bind:value={input} placeholder="Type a name…" style="background:#111;border:1px solid #333;padding:0.5rem;border-radius:4px;color:#eee;width:100%" />
	<div class="actions">
		<button onclick={() => (name.value = input || null)}>Set</button>
		<button onclick={() => (name.value = null)}>Set null</button>
		<button onclick={() => (name.value = undefined)}>Set undefined</button>
	</div>
	<p class="hint">Setting null or undefined falls back to "Anonymous".</p>
</div>

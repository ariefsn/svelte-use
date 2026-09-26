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
	<input
		bind:value={input}
		placeholder="Type a name…"
		class="bg-bg border-border-strong text-text w-full rounded border px-2 py-2"
	/>
	<div class="actions">
		<button onclick={() => (name.value = input || null)}>Set</button>
		<button onclick={() => (name.value = null)}>Set null</button>
		<button onclick={() => (name.value = undefined)}>Set undefined</button>
	</div>
	<p class="hint">Setting null or undefined falls back to "Anonymous".</p>
</div>

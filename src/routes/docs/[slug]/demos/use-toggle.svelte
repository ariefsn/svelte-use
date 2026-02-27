<script lang="ts">
	import { useToggle } from '$lib/state/useToggle.svelte.js';

	const toggle = useToggle(false);
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">value</span>
		<span class="value accent">{toggle.value}</span>
	</div>

	<div class="actions">
		<button onclick={() => toggle.toggle()}>toggle()</button>
		<button onclick={() => toggle.set(true)}>set(true)</button>
		<button onclick={() => toggle.set(false)}>set(false)</button>
	</div>

	<p class="hint">Click toggle() to flip the value, or use set() to force a specific state.</p>
</div>

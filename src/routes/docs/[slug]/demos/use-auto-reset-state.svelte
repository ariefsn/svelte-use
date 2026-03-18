<script lang="ts">
	import { useAutoResetState } from '$lib/state/useAutoResetState.svelte.js';
	const message = useAutoResetState('Ready', 2000);
</script>
<div class="demo-wrap">
	<div class="row">
		<span class="label">value</span>
		<span class="value accent">{message.value}</span>
	</div>
	<div class="actions">
		<button onclick={() => (message.value = 'Clicked!')}>Set "Clicked!"</button>
		<button onclick={() => (message.value = 'Hello!')}>Set "Hello!"</button>
	</div>
	<p class="hint">Value resets to "Ready" after 2 seconds of no changes.</p>
</div>

<script lang="ts">
	import { useWhenever } from '$lib/reactivity/useWhenever.svelte.js';
	let count = $state(0);
	let triggered = $state(0);
	useWhenever(
		() => count > 5,
		() => triggered++,
		{ runOnMounted: false }
	);
</script>
<div class="demo-wrap">
	<div class="row">
		<span class="label">count</span>
		<span class="value accent">{count}</span>
	</div>
	<div class="row">
		<span class="label">triggered (count &gt; 5)</span>
		<span class="value accent">{triggered}</span>
	</div>
	<div class="actions">
		<button onclick={() => count++}>Increment</button>
		<button onclick={() => (count = 0)}>Reset to 0</button>
	</div>
	<p class="hint">Callback fires each time count crosses above 5.</p>
</div>

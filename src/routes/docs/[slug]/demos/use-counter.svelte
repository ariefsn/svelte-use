<script lang="ts">
	import { useCounter } from '$lib/state/useCounter.svelte.js';

	const counter = useCounter(0);
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">value</span>
		<span class="value accent">{counter.value}</span>
	</div>

	<div class="actions">
		<button onclick={() => counter.inc()}>inc()</button>
		<button onclick={() => counter.inc(5)}>inc(5)</button>
		<button onclick={() => counter.dec()}>dec()</button>
		<button onclick={() => counter.dec(5)}>dec(5)</button>
		<button onclick={() => counter.reset()}>reset()</button>
	</div>

	<p class="hint">Use inc() / dec() to step by 1, or pass a delta. reset() returns to 0.</p>
</div>

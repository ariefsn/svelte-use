<script lang="ts">
	import { useLastChanged } from '$lib/state/useLastChanged.svelte.js';
	let count = $state(0);
	const lastChanged = useLastChanged(() => count);
</script>
<div class="demo-wrap">
	<div class="row">
		<span class="label">count</span>
		<span class="value accent">{count}</span>
	</div>
	<div class="row">
		<span class="label">lastChanged</span>
		<span class="value accent">{lastChanged() ? new Date(lastChanged()!).toLocaleTimeString() : 'never'}</span>
	</div>
	<div class="actions">
		<button onclick={() => count++}>Increment</button>
	</div>
	<p class="hint">Shows the timestamp of the last value change.</p>
</div>

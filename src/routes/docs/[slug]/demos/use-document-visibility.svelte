<script lang="ts">
	import { useDocumentVisibility } from '$lib/browser/sensors/useDocumentVisibility.svelte.js';
	const { current } = useDocumentVisibility();
	let changes = $state(0);
	$effect(() => {
		current();
		changes++;
	});
</script>
<div class="demo-wrap">
	<div class="row">
		<span class="label">visibility</span>
		<span class="value accent">{current()}</span>
	</div>
	<div class="row">
		<span class="label">changes</span>
		<span class="value accent">{changes}</span>
	</div>
	<p class="hint">Switch to another tab and back to see the state change.</p>
</div>

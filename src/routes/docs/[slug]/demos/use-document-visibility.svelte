<script lang="ts">
	import { untrack } from 'svelte';
	import { useDocumentVisibility } from '$lib/browser/sensors/useDocumentVisibility.svelte.js';

	const { current } = useDocumentVisibility();
	let changes = $state(0);
	let previous = current();

	// The increment must be untracked (it reads `changes` too, which would make the effect re-trigger
	// itself), and gated on an actual change so mounting doesn't count as one.
	$effect(() => {
		const now = current();
		if (now === previous) return;
		previous = now;
		untrack(() => {
			changes++;
		});
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

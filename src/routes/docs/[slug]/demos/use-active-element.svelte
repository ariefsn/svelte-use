<script lang="ts">
	import { useActiveElement } from '$lib/browser/interaction/useActiveElement.svelte.js';
	const { current } = useActiveElement();
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">active element</span>
		<span class="value accent">{current()?.tagName ?? 'none'}</span>
	</div>
	<div class="flex flex-wrap gap-2">
		<input
			placeholder="Focus me"
			class="bg-bg border-border-strong text-text rounded border px-2 py-2"
		/>
		<button>Or click me</button>
		<textarea
			rows="1"
			placeholder="Or me"
			class="bg-bg border-border-strong text-text rounded border px-2 py-2"
		></textarea>
	</div>
	<p class="hint">Tracks which element in the document currently has focus.</p>
</div>

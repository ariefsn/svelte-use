<script lang="ts">
	import { useActiveElement } from '$lib/browser/interaction/useActiveElement.svelte.js';
	const { current } = useActiveElement();
</script>
<div class="demo-wrap">
	<div class="row">
		<span class="label">active element</span>
		<span class="value accent">{current()?.tagName ?? 'none'}</span>
	</div>
	<div style="display:flex;gap:0.5rem;flex-wrap:wrap">
		<input placeholder="Focus me" style="background:#111;border:1px solid #333;padding:0.5rem;border-radius:4px;color:#eee" />
		<button>Or click me</button>
		<textarea rows="1" placeholder="Or me" style="background:#111;border:1px solid #333;padding:0.5rem;border-radius:4px;color:#eee"></textarea>
	</div>
	<p class="hint">Tracks which element in the document currently has focus.</p>
</div>

<script lang="ts">
	import { useTextDirection } from '$lib/browser/useTextDirection.svelte.js';
	const { current, set } = useTextDirection();
</script>
<div class="demo-wrap">
	<div class="row">
		<span class="label">direction</span>
		<span class="value accent">{current()}</span>
	</div>
	<div class="actions">
		<button onclick={() => set('ltr')}>LTR</button>
		<button onclick={() => set('rtl')}>RTL</button>
		<button onclick={() => set('auto')}>Auto</button>
	</div>
	<p class="hint">Changes the document's text direction attribute.</p>
</div>

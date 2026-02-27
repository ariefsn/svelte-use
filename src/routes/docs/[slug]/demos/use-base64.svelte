<script lang="ts">
	import { useBase64 } from '$lib/browser/storage/useBase64.svelte.js';

	let text = $state('hello');
	const encoded = useBase64(() => text);

	function oninput(e: Event) {
		text = (e.target as HTMLInputElement).value;
	}
</script>

<div class="demo-wrap">
	<p class="hint">Type text to see its live Base64 encoding.</p>

	<input type="text" value={text} {oninput} placeholder="Enter text to encode…" />

	<div class="row">
		<span class="label">input</span>
		<span class="value">{text || '—'}</span>
	</div>
	<div class="row">
		<span class="label">base64</span>
		<span class="value accent">{encoded() ?? '—'}</span>
	</div>
</div>

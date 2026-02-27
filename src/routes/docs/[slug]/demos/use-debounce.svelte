<script lang="ts">
	import { useDebounce } from '$lib/reactivity/useDebounce.svelte.js';

	let raw = $state('');
	const debounced = useDebounce(() => raw, 500);

	function oninput(e: Event) {
		raw = (e.target as HTMLInputElement).value;
	}
</script>

<div class="demo-wrap">
	<p class="hint">Type in the box — the debounced value updates 500ms after you stop typing.</p>

	<input type="text" value={raw} {oninput} placeholder="Type something…" />

	<div class="row">
		<span class="label">raw value</span>
		<span class="value">{raw || '—'}</span>
	</div>
	<div class="row">
		<span class="label">debounced</span>
		<span class="value accent">{debounced() || '—'}</span>
	</div>
</div>

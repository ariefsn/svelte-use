<script lang="ts">
	import { useDebounceFn } from '$lib/performance/useDebounceFn.svelte.js';

	let query = $state('');
	let committed = $state('');
	let callCount = $state(0);

	const search = useDebounceFn((q: string) => {
		committed = q;
		callCount++;
	}, 500);

	function oninput(e: Event) {
		query = (e.target as HTMLInputElement).value;
		search(query);
	}
</script>

<div class="demo-wrap">
	<p class="hint">Type in the box — the debounced function fires 500ms after you stop.</p>

	<input type="text" placeholder="Type something…" value={query} {oninput} />

	<div class="row">
		<span class="label">raw value</span><span class="value">{query || '—'}</span>
	</div>
	<div class="row">
		<span class="label">committed</span><span class="value accent">{committed || '—'}</span>
	</div>
	<div class="row">
		<span class="label">fn calls</span><span class="value accent">{callCount}</span>
	</div>
</div>

<script lang="ts">
	import { usePrevious } from '$lib/state/usePrevious.svelte.js';

	let current = $state('hello');
	const previous = usePrevious(() => current);

	function oninput(e: Event) {
		current = (e.target as HTMLInputElement).value;
	}
</script>

<div class="demo-wrap">
	<p class="hint">Type in the box — the previous value updates on each change.</p>

	<input type="text" value={current} {oninput} placeholder="Type something…" />

	<div class="row">
		<span class="label">current</span>
		<span class="value accent">{current || '—'}</span>
	</div>
	<div class="row">
		<span class="label">previous</span>
		<span class="value">{previous() ?? '—'}</span>
	</div>
</div>

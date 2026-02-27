<script lang="ts">
	import { useSessionStorage } from '$lib/browser/storage/useSessionStorage.svelte.js';

	const store = useSessionStorage('demo-key', 'initial value');

	function oninput(e: Event) {
		store.set((e.target as HTMLInputElement).value);
	}
</script>

<div class="demo-wrap">
	<p class="hint">
		Value is persisted to <code>sessionStorage</code> — it survives page navigation within the same tab.
	</p>

	<input type="text" value={store.value} {oninput} placeholder="Type a value to persist…" />

	<div class="row">
		<span class="label">stored</span>
		<span class="value accent">{store.value}</span>
	</div>

	<div class="actions">
		<button onclick={() => store.remove()}>remove()</button>
	</div>

	<p class="hint">
		Clicking remove() clears the key from sessionStorage and resets to the initial value.
	</p>
</div>

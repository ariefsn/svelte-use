<script lang="ts">
	import { useStorage } from '$lib';

	const local = useStorage('svelte-use-demo-local', 'hello', 'local');
	const session = useStorage('svelte-use-demo-session', 'hello', 'session');
</script>

<div class="demo-wrap">
	<div class="field">
		<span class="label">localStorage</span>
		<input value={local.value} oninput={(e) => local.set(e.currentTarget.value)} />
		<button onclick={local.remove}>remove()</button>
	</div>

	<div class="field">
		<span class="label">sessionStorage</span>
		<input value={session.value} oninput={(e) => session.set(e.currentTarget.value)} />
		<button onclick={session.remove}>remove()</button>
	</div>

	<p class="hint">
		Reload the page: the localStorage value survives, the sessionStorage one survives only in this
		tab. Open a second tab to see cross-tab sync.
	</p>
</div>

<style>
	.field {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		flex-wrap: wrap;
	}
	.field .label {
		min-width: 120px;
		font-family: monospace;
		font-size: 0.8rem;
		color: #666;
	}
	input {
		flex: 1;
		min-width: 140px;
		padding: 0.4rem 0.6rem;
		background: #0d0d0d;
		border: 1px solid #262626;
		border-radius: 6px;
		color: #ddd;
		font-size: 0.88rem;
	}
	input:focus {
		outline: none;
		border-color: #a78bfa;
	}
</style>

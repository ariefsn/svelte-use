<script lang="ts">
	import { useAsyncState } from '$lib/reactivity/useAsyncState.svelte.js';
	const { current, isLoading, isReady, error, execute } = useAsyncState(
		() =>
			fetch('https://jsonplaceholder.typicode.com/todos/1').then((r) => r.json()),
		null
	);
</script>
<div class="demo-wrap">
	<div class="row">
		<span class="label">isLoading</span>
		<span class="value accent">{isLoading()}</span>
	</div>
	<div class="row">
		<span class="label">isReady</span>
		<span class="value accent">{isReady()}</span>
	</div>
	<div class="row">
		<span class="label">data</span>
		<span class="value accent" style="font-size:0.8rem">{JSON.stringify(current())}</span>
	</div>
	{#if error()}
		<div class="row">
			<span class="label">error</span>
			<span class="value" style="color:#f87171">{error()}</span>
		</div>
	{/if}
	<div class="actions">
		<button onclick={() => execute()}>Re-execute</button>
	</div>
	<p class="hint">Fetches a todo from JSONPlaceholder API.</p>
</div>

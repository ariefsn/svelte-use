<script lang="ts">
	import { useFetch } from '$lib/async/useFetch.svelte.js';

	interface Post {
		id: number;
		title: string;
		body: string;
	}

	let postId = $state(1);

	const { data, error, isFetching, execute } = useFetch<Post>(
		() => `https://jsonplaceholder.typicode.com/posts/${postId}`
	);
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">post id</span>
		<span class="value accent">#{postId}</span>
		<span
			class="rounded-full px-2 py-[0.1rem] font-mono text-[0.75rem] {isFetching()
				? 'bg-accent-bg text-accent'
				: error()
					? 'bg-danger-bg text-danger'
					: 'bg-success-bg text-success'}"
		>
			{isFetching() ? 'fetching…' : error() ? 'error' : 'ready'}
		</span>
	</div>

	<div class="actions">
		<button onclick={() => postId--} disabled={postId <= 1}>← Prev</button>
		<button onclick={() => postId++} disabled={postId >= 100}>Next →</button>
		<button onclick={execute}>Refetch</button>
	</div>

	<div class="divider"></div>

	{#if isFetching()}
		<p class="hint">Loading…</p>
	{:else if error()}
		<p class="hint text-danger">Error: {error()?.message}</p>
	{:else if data()}
		<p class="text-text-dim m-0 text-[0.9rem] font-semibold capitalize">{data()?.title}</p>
		<p class="text-text-muted mt-1 mb-0 text-[0.82rem] leading-normal">{data()?.body}</p>
	{/if}
</div>

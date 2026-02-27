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
    <span class="status {isFetching() ? 'loading' : error() ? 'error' : 'ok'}">
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
    <p class="hint" style="color:#f87171">Error: {error()?.message}</p>
  {:else if data()}
    <p class="post-title">{data()?.title}</p>
    <p class="post-body">{data()?.body}</p>
  {/if}
</div>

<style>
  .status {
    font-size: 0.75rem;
    padding: 0.1rem 0.5rem;
    border-radius: 999px;
    font-family: monospace;
  }

  .status.loading { background: #1e1e2e; color: #a78bfa; }
  .status.error   { background: #2a1414; color: #f87171; }
  .status.ok      { background: #142a14; color: #86efac; }

  .post-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: #ccc;
    margin: 0;
    text-transform: capitalize;
  }

  .post-body {
    font-size: 0.82rem;
    color: #666;
    margin: 0.25rem 0 0;
    line-height: 1.5;
  }
</style>

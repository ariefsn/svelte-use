<script lang="ts">
  import { useIntervalFn } from '$lib/time/useIntervalFn.svelte.js';

  let count = $state(0);

  const { resume, pause, isActive } = useIntervalFn(() => count++, 500);
</script>

<div class="demo-wrap">
  <div class="big-num">{count}</div>

  <div class="row">
    <span class="label">active</span>
    <span class="value accent">{isActive()}</span>
  </div>

  <div class="actions">
    {#if isActive()}
      <button onclick={pause}>pause()</button>
    {:else}
      <button onclick={resume}>resume()</button>
    {/if}
    <button onclick={() => (count = 0)}>reset count</button>
  </div>

  <p class="hint">Does not start automatically — call resume() · interval: 500ms</p>
</div>

<style>
  .big-num {
    font-size: 3.5rem;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    color: #a78bfa;
    line-height: 1;
    margin-bottom: 0.5rem;
  }
</style>

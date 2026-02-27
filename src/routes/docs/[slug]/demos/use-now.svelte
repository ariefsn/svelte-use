<script lang="ts">
  import { useNow } from '$lib/time/useNow.svelte.js';

  const now = useNow({ interval: 1000 });

  const time = $derived(new Date(now()).toLocaleTimeString());
  const date = $derived(new Date(now()).toLocaleDateString());
</script>

<div class="demo-wrap">
  <div class="clock">{time}</div>
  <div class="row">
    <span class="label">date</span>
    <span class="value">{date}</span>
  </div>
  <div class="row">
    <span class="label">unix ms</span>
    <span class="value accent">{now()}</span>
  </div>
  <p class="hint">Updates every 1000ms via setInterval</p>
</div>

<style>
  .clock {
    font-size: 2.75rem;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    color: #a78bfa;
    line-height: 1;
    margin-bottom: 0.5rem;
    font-family: monospace;
  }
</style>

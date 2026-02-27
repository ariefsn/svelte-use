<script lang="ts">
  import { useTimestamp } from '$lib/time/useTimestamp.svelte.js';

  const timestamp = useTimestamp({ interval: 1000 });

  const iso = $derived(new Date(timestamp()).toISOString());
  const local = $derived(new Date(timestamp()).toLocaleString());
</script>

<div class="demo-wrap">
  <div class="ts-value">{timestamp()}</div>

  <div class="row">
    <span class="label">ISO</span>
    <span class="value">{iso}</span>
  </div>
  <div class="row">
    <span class="label">local</span>
    <span class="value">{local}</span>
  </div>

  <p class="hint">Unix timestamp in milliseconds · updates every 1000ms</p>
</div>

<style>
  .ts-value {
    font-size: 1.6rem;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    color: #a78bfa;
    line-height: 1;
    margin-bottom: 0.5rem;
    font-family: monospace;
    word-break: break-all;
  }
</style>

<script lang="ts">
  import { useInterval } from '$lib/time/useInterval.svelte.js';

  let count = $state(0);
  let delay = $state(1000);

  const { pause, resume, isActive } = useInterval(() => count++, () => delay);
</script>

<div class="demo-wrap">
  <div class="big-num">{count}</div>

  <div class="row">
    <span class="label">active</span>
    <span class="value accent">{isActive()}</span>
  </div>

  <div class="row">
    <span class="label">delay</span>
    <input
      type="range"
      min="200"
      max="2000"
      step="100"
      bind:value={delay}
      style="flex:1"
    />
    <span class="value accent">{delay}ms</span>
  </div>

  <div class="actions">
    <button onclick={pause} disabled={!isActive()}>pause()</button>
    <button onclick={resume} disabled={isActive()}>resume()</button>
    <button onclick={() => (count = 0)}>reset count</button>
  </div>

  <p class="hint">Changing the delay restarts the interval immediately</p>
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

  input[type='range'] {
    accent-color: #a78bfa;
  }
</style>

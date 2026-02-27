<script lang="ts">
  import { useParallax } from '$lib/animation/useParallax.svelte.js';

  let card = $state<HTMLDivElement | null>(null);
  const { x, y } = useParallax(() => card, { speed: 0.06 });
</script>

<div class="demo-wrap">
  <div class="scene">
    <div
      class="card"
      bind:this={card}
      style:transform="translate({x}px, {y}px)"
    >
      <span class="card-label">Move cursor over me</span>
    </div>
  </div>

  <div class="row">
    <span class="label">x offset</span>
    <span class="value accent">{x.toFixed(2)}px</span>
  </div>
  <div class="row">
    <span class="label">y offset</span>
    <span class="value accent">{y.toFixed(2)}px</span>
  </div>

  <p class="hint">Offset is calculated from the centre of the card · speed = 0.06</p>
</div>

<style>
  .scene {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 140px;
    background: #0d0d0d;
    border-radius: 8px;
    border: 1px solid #222;
  }

  .card {
    width: 180px;
    height: 90px;
    background: #1a1630;
    border: 1px solid #a78bfa55;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    will-change: transform;
    transition: box-shadow 0.2s;
    box-shadow: 0 0 0 0 #a78bfa00;
  }

  .card:hover {
    box-shadow: 0 8px 32px #a78bfa22;
  }

  .card-label {
    font-size: 0.8rem;
    color: #a78bfa;
    pointer-events: none;
  }
</style>

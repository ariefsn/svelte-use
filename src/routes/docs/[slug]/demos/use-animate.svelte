<script lang="ts">
  import { useAnimate } from '$lib/animation/useAnimate.svelte.js';

  let el = $state<HTMLDivElement | null>(null);

  const { play, pause, cancel, finish, isRunning } = useAnimate(
    () => el,
    () => [
      { transform: 'translateX(0px)', background: '#a78bfa' },
      { transform: 'translateX(160px)', background: '#7c3aed' }
    ],
    () => ({ duration: 800, easing: 'ease-in-out', fill: 'forwards', iterations: 1 })
  );
</script>

<div class="demo-wrap">
  <div class="stage">
    <div class="box" bind:this={el}></div>
  </div>

  <div class="row">
    <span class="label">playState</span>
    <span class="value accent">{isRunning() ? 'running' : 'paused / idle'}</span>
  </div>

  <div class="actions">
    <button onclick={play}>play()</button>
    <button onclick={pause}>pause()</button>
    <button onclick={cancel}>cancel()</button>
    <button onclick={finish}>finish()</button>
  </div>

  <p class="hint">play() starts the animation · cancel() resets · finish() jumps to end</p>
</div>

<style>
  .stage {
    height: 56px;
    background: #0d0d0d;
    border-radius: 8px;
    border: 1px solid #222;
    position: relative;
    display: flex;
    align-items: center;
    padding: 0 12px;
  }

  .box {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background: #a78bfa;
    flex-shrink: 0;
  }
</style>

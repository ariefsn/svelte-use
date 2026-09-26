<script lang="ts">
	import { useRafFn } from '$lib';

	let angle = $state(0);
	let frames = $state(0);

	const { isActive, pause, resume } = useRafFn(({ delta }) => {
		// Degrees per millisecond keeps the speed frame-rate independent.
		angle = (angle + delta * 0.18) % 360;
		frames++;
	});
</script>

<div class="demo-wrap">
	<div class="stage">
		<div class="box" style="transform: rotate({angle}deg)"></div>
	</div>

	<div class="row">
		<span class="label">angle</span>
		<span class="value accent">{angle.toFixed(1)}°</span>
	</div>
	<div class="row">
		<span class="label">frames</span>
		<span class="value accent">{frames}</span>
	</div>
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
		<button onclick={() => ((angle = 0), (frames = 0))}>reset</button>
	</div>
	<p class="hint">
		The callback receives <code>delta</code>, so the rotation speed stays constant regardless of
		refresh rate.
	</p>
</div>

<style>
	.stage {
		display: flex;
		justify-content: center;
		padding: 0.75rem 0;
	}
	.box {
		width: 56px;
		height: 56px;
		border-radius: 10px;
		background: linear-gradient(135deg, #a78bfa, #7c3aed);
	}
</style>

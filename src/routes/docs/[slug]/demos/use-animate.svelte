<script lang="ts">
	import { useAnimate } from '$lib/animation/useAnimate.svelte.js';

	let el = $state<HTMLDivElement | null>(null);

	const { play, pause, cancel, finish, isRunning } = useAnimate(
		() => el,
		// Concrete colours rather than `var(--color-accent)`: the Web Animations
		// API interpolates between colour *values*, and browsers do not reliably
		// resolve a custom property inside a keyframe.
		() => [
			{ transform: 'translateX(0px)', background: '#a78bfa' },
			{ transform: 'translateX(160px)', background: '#7c3aed' }
		],
		() => ({ duration: 800, easing: 'ease-in-out', fill: 'forwards', iterations: 1 })
	);
</script>

<div class="demo-wrap">
	<div class="bg-bg-sunken border-border relative flex h-14 items-center rounded-lg border px-3">
		<div class="bg-accent h-8 w-8 shrink-0 rounded-md" bind:this={el}></div>
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

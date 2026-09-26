<script lang="ts">
	import { useLongPress } from '$lib/browser/interaction/useLongPress.svelte.js';
	let el = $state<HTMLDivElement | null>(null);
	let count = $state(0);
	let pressing = $state(false);
	useLongPress(
		() => el,
		() => {
			count++;
			pressing = false;
		},
		{ delay: 800 }
	);
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">long presses</span>
		<span class="value accent">{count}</span>
	</div>
	<div
		bind:this={el}
		onpointerdown={() => (pressing = true)}
		onpointerup={() => (pressing = false)}
		onpointercancel={() => (pressing = false)}
		class="border-border-strong text-text-muted cursor-pointer rounded-lg border p-8 text-center transition-colors duration-200 select-none {pressing
			? 'bg-accent-bg'
			: 'bg-bg'}"
	>
		{pressing ? 'Hold…' : 'Press and hold (800ms)'}
	</div>
	<p class="hint">Hold the element for 800ms to trigger. Moving too far cancels.</p>
</div>

<script lang="ts">
	import { useFullscreen } from '$lib/browser/useFullscreen.svelte.js';

	let panel = $state<HTMLElement | null>(null);

	const page = useFullscreen();
	const element = useFullscreen(() => panel);
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">supported</span>
		<span class="value accent">{page.isSupported()}</span>
	</div>
	<div class="row">
		<span class="label">page fullscreen</span>
		<span class="value accent">{page.isFullscreen()}</span>
	</div>
	<div class="row">
		<span class="label">panel fullscreen</span>
		<span class="value accent">{element.isFullscreen()}</span>
	</div>

	<div class="actions">
		<button onclick={page.toggle}>Toggle Page</button>
		<button onclick={element.toggle}>Toggle Panel</button>
	</div>

	<div
		bind:this={panel}
		class="bg-surface border-border flex min-h-24 items-center justify-center rounded-lg border p-4"
	>
		<span class="text-text-muted text-[0.8rem]">
			{element.isFullscreen()
				? 'This panel is fullscreen — press Escape'
				: 'This panel can go fullscreen on its own'}
		</span>
	</div>

	<p class="hint">
		Two instances share one page. Only the one whose target is on screen reports
		<span class="value accent">true</span>, which is what makes per-element buttons behave. Press
		Escape and the state follows on its own, because it tracks the event rather than what was last
		called.
	</p>
</div>

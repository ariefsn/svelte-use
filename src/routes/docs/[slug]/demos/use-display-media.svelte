<script lang="ts">
	import { useDisplayMedia } from '$lib/browser/media/useDisplayMedia.svelte.js';

	const screen = useDisplayMedia({ options: { video: true, audio: false } });
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">supported</span>
		<span class="value accent">{screen.isSupported()}</span>
	</div>
	<div class="row">
		<span class="label">sharing</span>
		<span class="value accent">{screen.isActive()}</span>
	</div>
	{#if screen.error()}
		<div class="row">
			<span class="label">error</span>
			<span class="value">{screen.error()?.name}</span>
		</div>
	{/if}

	<div class="actions">
		<button onclick={() => screen.start()} disabled={!screen.isSupported() || screen.isActive()}>
			Share Screen
		</button>
		<button onclick={screen.stop} disabled={!screen.isActive()}>Stop</button>
	</div>

	{#if screen.stream()}
		<video
			autoplay
			playsinline
			muted
			srcobject={screen.stream()!}
			class="mt-1 w-full max-w-[420px] rounded-lg bg-black"
		></video>
	{/if}

	<p class="hint">
		Stop the share from the browser's own floating bar — <span class="value accent">sharing</span>
		flips back to <span class="value accent">false</span> on its own, which is the behaviour a naive wrapper
		misses.
	</p>
</div>

<script lang="ts">
	import { useUserMedia, type UserMediaFlip } from '$lib/browser/media/useUserMedia.svelte.js';

	const FLIPS: UserMediaFlip[] = ['none', 'horizontal', 'vertical', 'both'];

	let flip = $state<UserMediaFlip>('horizontal');

	// `flip` is a getter, so changing it updates the preview transform without
	// touching the stream — no reacquire, no second permission prompt.
	const camera = useUserMedia({ constraints: { video: true, audio: false }, flip: () => flip });
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">supported</span>
		<span class="value accent">{camera.isSupported()}</span>
	</div>
	<div class="row">
		<span class="label">active</span>
		<span class="value accent">{camera.isActive()}</span>
	</div>
	<div class="row">
		<span class="label">transform</span>
		<span class="value accent">{camera.transform()}</span>
	</div>
	{#if camera.error()}
		<div class="row">
			<span class="label">error</span>
			<span class="value">{camera.error()?.name}</span>
		</div>
	{/if}

	<div class="actions">
		<button onclick={() => camera.start()} disabled={!camera.isSupported() || camera.isActive()}>
			Start Camera
		</button>
		<button onclick={camera.stop} disabled={!camera.isActive()}>Stop</button>
	</div>

	<div class="actions">
		{#each FLIPS as option (option)}
			<button class:active={flip === option} onclick={() => (flip = option)}>
				{option}
			</button>
		{/each}
	</div>

	{#if camera.stream()}
		<video
			autoplay
			playsinline
			muted
			srcobject={camera.stream()!}
			style:transform={camera.transform()}
			class="mt-1 w-full max-w-[320px] rounded-lg bg-black"
		></video>
	{/if}

	<p class="hint">
		Flipping is a CSS transform on the preview only — the captured stream is untouched, so a
		recording would not be mirrored. Switch flips while the camera runs: it never re-prompts.
	</p>
</div>

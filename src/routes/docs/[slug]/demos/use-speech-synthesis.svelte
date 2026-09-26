<script lang="ts">
	import { useSpeechSynthesis } from '$lib/browser/useSpeechSynthesis.svelte.js';

	let text = $state('Svelte makes reactivity feel effortless.');
	let voiceIndex = $state(0);
	let rate = $state(1);

	const speech = useSpeechSynthesis({
		voice: () => speech.voices()[voiceIndex] ?? null,
		rate: () => rate
	});
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">supported</span>
		<span class="value accent">{speech.isSupported()}</span>
	</div>
	<div class="row">
		<span class="label">status</span>
		<span class="value accent">{speech.status()}</span>
	</div>
	<div class="row">
		<span class="label">voices</span>
		<span class="value accent">{speech.voices().length}</span>
	</div>

	<input type="text" bind:value={text} />

	{#if speech.voices().length > 0}
		<div class="row">
			<span class="label">voice</span>
			<select bind:value={voiceIndex}>
				{#each speech.voices() as voice, index (voice.voiceURI)}
					<option value={index}>{voice.name} ({voice.lang})</option>
				{/each}
			</select>
		</div>
	{/if}

	<div class="row">
		<span class="label">rate {rate.toFixed(1)}</span>
		<input type="range" bind:value={rate} min="0.5" max="2" step="0.1" />
	</div>

	<div class="actions">
		<button onclick={() => speech.speak(text)} disabled={!speech.isSupported()}>Speak</button>
		<button onclick={speech.pause} disabled={!speech.isSpeaking()}>Pause</button>
		<button onclick={speech.resume} disabled={speech.status() !== 'paused'}>Resume</button>
		<button onclick={speech.stop} disabled={speech.status() === 'idle'}>Stop</button>
	</div>

	{#if speech.error()}
		<div class="row">
			<span class="label">error</span>
			<span class="value">{speech.error()?.error}</span>
		</div>
	{/if}

	<p class="hint">
		The voice count may be zero for a moment — Chrome loads voices asynchronously and announces them
		with an event, so a one-shot read would show an empty list forever. Navigating away stops the
		speech, which the browser would otherwise continue.
	</p>
</div>

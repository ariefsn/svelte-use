<script lang="ts">
	import { useSpeechRecognition } from '$lib/browser/useSpeechRecognition.svelte.js';

	const speech = useSpeechRecognition();
	const isSupported = speech.isSupported();

	const errorHints: Record<string, string> = {
		'not-allowed': 'Microphone permission was denied. Allow it in your browser site settings.',
		'service-not-allowed': 'The browser blocked the speech service for this page.',
		network:
			"The browser's speech service is unreachable. Chromium forks (Arc, Brave, Vivaldi) ship without Google's speech API keys, so this fails there — try Chrome or Edge.",
		'no-speech': 'No speech was detected before the session timed out.',
		aborted: 'The session was aborted.'
	};
</script>

<div class="demo-wrap">
	{#if !isSupported}
		<div
			class="bg-warning-bg border-border-strong text-text-dim flex items-center gap-2.5 rounded-lg border px-4 py-3 text-[0.87rem]"
		>
			<span class="text-warning shrink-0 text-[1.1rem]">⚠</span>
			<span>
				Speech Recognition is not supported in this browser. Try Chrome or Edge on desktop.
			</span>
		</div>
	{:else}
		<p class="hint">Click Start and speak — your browser will transcribe in real time.</p>

		<button
			class="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-lg border p-2.5 text-[0.9rem] transition-all duration-150 {speech.isListening()
				? 'bg-danger-bg border-danger text-danger'
				: 'bg-surface border-border-strong text-text-muted'}"
			onclick={() => (speech.isListening() ? speech.stop() : speech.start())}
		>
			<span
				class="h-2 w-2 shrink-0 rounded-full transition-colors duration-200 {speech.isListening()
					? 'bg-danger animate-pulse'
					: 'bg-text-faint'}"
			></span>
			{speech.isListening() ? 'Stop recording' : 'Start recording'}
		</button>

		{#if speech.error()}
			<div
				class="bg-warning-bg border-warning-border text-warning flex flex-col gap-1.5 rounded-lg border px-3 py-2.5 text-[0.83rem] leading-normal [&_span]:opacity-80 [&_strong]:font-mono [&_strong]:font-semibold"
			>
				<strong>{speech.error()}</strong>
				{#if errorHints[speech.error() ?? '']}
					<span>{errorHints[speech.error() ?? '']}</span>
				{/if}
			</div>
		{/if}

		<div
			class="bg-bg-sunken border-surface min-h-[80px] rounded-lg border p-3 text-[0.9rem] leading-relaxed transition-colors duration-200 {speech.result()
				? 'text-text-dim'
				: 'text-text-faint'}"
		>
			{speech.result() || 'Transcript will appear here…'}
		</div>
	{/if}
</div>

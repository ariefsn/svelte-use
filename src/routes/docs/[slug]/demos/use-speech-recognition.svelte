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
		<div class="unsupported">
			<span class="unsupported-icon">⚠</span>
			<span>
				Speech Recognition is not supported in this browser. Try Chrome or Edge on desktop.
			</span>
		</div>
	{:else}
		<p class="hint">Click Start and speak — your browser will transcribe in real time.</p>

		<button
			class="record-btn"
			class:recording={speech.isListening()}
			onclick={() => (speech.isListening() ? speech.stop() : speech.start())}
		>
			<span class="rec-dot" class:active={speech.isListening()}></span>
			{speech.isListening() ? 'Stop recording' : 'Start recording'}
		</button>

		{#if speech.error()}
			<div class="err">
				<strong>{speech.error()}</strong>
				{#if errorHints[speech.error() ?? '']}
					<span>{errorHints[speech.error() ?? '']}</span>
				{/if}
			</div>
		{/if}

		<div class="transcript" class:has-text={!!speech.result()}>
			{speech.result() || 'Transcript will appear here…'}
		</div>
	{/if}
</div>

<style>
	.unsupported {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.75rem 1rem;
		background: #1a1400;
		border: 1px solid #555;
		border-radius: 8px;
		font-size: 0.87rem;
		color: #aaa;
	}

	.unsupported-icon {
		font-size: 1.1rem;
		flex-shrink: 0;
		color: #f0a;
		filter: sepia(1) saturate(3) hue-rotate(10deg);
	}

	.record-btn {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.6rem;
		padding: 0.65rem;
		background: #1a1a1a;
		border: 1px solid #333;
		border-radius: 8px;
		color: #888;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.15s;
	}
	.record-btn.recording {
		background: #1a1010;
		border-color: #f87171;
		color: #f87171;
	}
	.rec-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #444;
		flex-shrink: 0;
		transition: background 0.2s;
	}
	.rec-dot.active {
		background: #f87171;
		animation: blink 1s infinite;
	}
	@keyframes blink {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.3;
		}
	}
	.transcript {
		min-height: 80px;
		padding: 0.75rem;
		background: #0d0d0d;
		border: 1px solid #1e1e1e;
		border-radius: 8px;
		font-size: 0.9rem;
		color: #444;
		line-height: 1.55;
		transition: color 0.2s;
	}
	.transcript.has-text {
		color: #ccc;
	}
	.err {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		padding: 0.6rem 0.75rem;
		border-radius: 8px;
		background: #2a1e0f;
		border: 1px solid #92400e;
		color: #fbbf24;
		font-size: 0.83rem;
		line-height: 1.5;
	}
	.err strong {
		font-family: monospace;
		font-weight: 600;
	}
	.err span {
		color: #d1a55a;
	}
</style>

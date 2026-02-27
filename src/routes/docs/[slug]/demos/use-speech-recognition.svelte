<script lang="ts">
	import { useSpeechRecognition } from '$lib/browser/useSpeechRecognition.svelte.js';
	import { browser } from '$app/environment';

	// Detect support at component init time (browser only)
	const isSupported =
		browser &&
		(typeof (window as any).SpeechRecognition !== 'undefined' ||
			typeof (window as any).webkitSpeechRecognition !== 'undefined');

	const speech = useSpeechRecognition();
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
</style>

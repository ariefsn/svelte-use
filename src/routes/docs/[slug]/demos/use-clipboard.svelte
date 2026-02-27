<script lang="ts">
	import { useClipboard } from '$lib/browser/useClipboard.svelte.js';

	const clipboard = useClipboard();

	const snippets = [
		'npm install @ariefsn/svelte-use',
		'import { useMouse } from "@ariefsn/svelte-use"',
		'const mouse = useMouse(); mouse.x()'
	];
</script>

<div class="demo-wrap">
	<p class="hint">Click any snippet to copy it to your clipboard.</p>

	{#each snippets as snippet}
		<button class="snippet-btn" onclick={() => clipboard.copy(snippet)}>
			<code>{snippet}</code>
			<span class="copy-icon">{clipboard.text() === snippet && clipboard.copied() ? '✓' : '⎘'}</span
			>
		</button>
	{/each}

	{#if clipboard.copied()}
		<div class="toast">Copied to clipboard!</div>
	{/if}
</div>

<style>
	.snippet-btn {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: #111;
		border: 1px solid #222;
		border-radius: 6px;
		text-align: left;
		cursor: pointer;
		transition:
			border-color 0.15s,
			background 0.15s;
	}
	.snippet-btn:hover {
		border-color: #a78bfa55;
		background: #1a1630;
	}
	.snippet-btn code {
		font-family: monospace;
		font-size: 0.78rem;
		color: #888;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.copy-icon {
		font-size: 0.9rem;
		color: #444;
		flex-shrink: 0;
	}
	.snippet-btn:hover .copy-icon {
		color: #a78bfa;
	}
	.toast {
		padding: 0.5rem 0.75rem;
		background: #1a3a1a;
		border: 1px solid #166534;
		border-radius: 6px;
		font-size: 0.85rem;
		color: #4ade80;
		text-align: center;
	}
</style>

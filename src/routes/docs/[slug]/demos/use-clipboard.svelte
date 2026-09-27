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

	{#each snippets as snippet (snippet)}
		<button
			class="group bg-bg border-border hover:border-accent/40 hover:bg-accent-bg flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border px-3 py-2 text-left transition-colors"
			onclick={() => clipboard.copy(snippet)}
		>
			<code>{snippet}</code>
			<span class="text-text-faint group-hover:text-accent shrink-0 text-[0.9rem]"
				>{clipboard.text() === snippet && clipboard.copied() ? '✓' : '⎘'}</span
			>
		</button>
	{/each}

	{#if clipboard.copied()}
		<div
			class="bg-success-bg border-success-border text-success rounded-md border px-3 py-2 text-center text-[0.85rem]"
		>
			Copied to clipboard!
		</div>
	{/if}
</div>

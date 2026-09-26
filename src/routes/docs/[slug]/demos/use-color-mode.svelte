<script lang="ts">
	import { useColorMode } from '$lib';

	let preview = $state<HTMLDivElement | null>(null);

	// Scoped to the preview box rather than <html>, so this demo themes only
	// itself. Omit `target` to drive the whole document.
	const theme = useColorMode({
		target: () => preview,
		attribute: 'data-theme',
		storageKey: 'svelte-use-demo-color-mode'
	});

	const options = ['auto', 'light', 'dark'] as const;
</script>

<div class="demo-wrap">
	<div class="actions">
		{#each options as option (option)}
			<button class:active={theme.mode() === option} onclick={() => theme.set(option)}>
				{option}
			</button>
		{/each}
		<button onclick={() => theme.toggle()}>toggle</button>
		<button onclick={() => theme.reset()}>reset</button>
	</div>

	<div class="row">
		<span class="label">mode</span>
		<span class="value accent">{theme.mode()}</span>
	</div>
	<div class="row">
		<span class="label">resolved</span>
		<span class="value accent">{theme.resolved()}</span>
	</div>
	<div class="row">
		<span class="label">isDark</span>
		<span class="value">{theme.isDark()}</span>
	</div>
	<div class="row">
		<span class="label">system</span>
		<span class="value">{theme.system()}</span>
	</div>

	<div class="preview" bind:this={preview}>
		<strong>Preview</strong>
		<span>data-theme="{theme.resolved()}"</span>
	</div>

	<p class="hint">
		The selection persists, so it survives a reload. On <code>auto</code> it keeps following your OS
		appearance. A flash on first paint needs <code>colorModeScript()</code> in
		<code>app.html</code> — a composable runs after hydration, which is after first paint.
	</p>
</div>

<style>
	.preview {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.75rem 0.9rem;
		border-radius: 8px;
		border: 1px solid #2a2a2a;
		background: #111;
		color: #e8e8e8;
		font-size: 0.85rem;
	}
	.preview span {
		font-family: monospace;
		color: #888;
	}
	.preview[data-theme='light'] {
		border-color: #e3e3e6;
		background: #fff;
		color: #1a1a1a;
	}
	.preview[data-theme='light'] span {
		color: #666;
	}
</style>

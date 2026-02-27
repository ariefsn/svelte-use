<script lang="ts">
	import { useBreakpoints } from '$lib';

	const bp = useBreakpoints({ sm: 640, md: 768, lg: 1024, xl: 1280 });
</script>

<div class="demo-root">
	<p class="hint">Resize your browser window to see the active breakpoints change.</p>

	<div class="grid">
		{#each ['sm', 'md', 'lg', 'xl'] as key}
			<div class="chip" class:active={bp.is(key)}>
				<span class="key">{key}</span>
				<span class="px">{key === 'sm' ? '640' : key === 'md' ? '768' : key === 'lg' ? '1024' : '1280'}px</span>
				<span class="status">{bp.is(key) ? '✓' : '–'}</span>
			</div>
		{/each}
	</div>

	<div class="active-row">
		<span class="label">active</span>
		<span class="value">{bp.active().length ? bp.active().join(', ') : 'none'}</span>
	</div>
</div>

<style>
	.demo-root {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.hint {
		margin: 0;
		font-size: 0.82rem;
		color: #666;
		font-style: italic;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.5rem;
	}
	.chip {
		background: #1e1e1e;
		border: 1px solid #2e2e2e;
		border-radius: 8px;
		padding: 0.6rem 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		transition: border-color 0.15s, background 0.15s;
	}
	.chip.active {
		background: #1a1630;
		border-color: #a78bfa;
	}
	.key {
		font-family: monospace;
		font-size: 0.88rem;
		font-weight: 600;
		color: #aaa;
	}
	.chip.active .key {
		color: #a78bfa;
	}
	.px {
		font-size: 0.75rem;
		color: #555;
	}
	.status {
		font-size: 0.8rem;
		color: #555;
	}
	.chip.active .status {
		color: #4ade80;
	}
	.active-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.88rem;
	}
	.label {
		color: #666;
		font-family: monospace;
	}
	.value {
		font-family: monospace;
		color: #a78bfa;
	}
</style>

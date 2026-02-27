<script lang="ts">
	import { useLocalStorage } from '$lib';

	const theme = useLocalStorage<'light' | 'dark'>('demo-ls-theme', 'light');
	const count = useLocalStorage<number>('demo-ls-count', 0);
</script>

<div class="demo-root">
	<div class="row">
		<span class="label">theme</span>
		<span class="value">{theme.value}</span>
		<div class="actions">
			<button onclick={() => theme.set('light')}>Light</button>
			<button onclick={() => theme.set('dark')}>Dark</button>
		</div>
	</div>

	<div class="row">
		<span class="label">count</span>
		<span class="value">{count.value}</span>
		<div class="actions">
			<button onclick={() => count.set(count.value + 1)}>+1</button>
			<button onclick={() => count.set(count.value - 1)}>-1</button>
			<button onclick={() => count.set(0)}>Reset</button>
		</div>
	</div>

	<p class="hint">Refresh the page — values survive.</p>
</div>

<style>
	.demo-root {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}
	.label {
		color: #666;
		font-family: monospace;
		min-width: 60px;
		font-size: 0.85rem;
	}
	.value {
		font-family: monospace;
		font-weight: 600;
		color: #a78bfa;
		min-width: 60px;
	}
	.actions {
		display: flex;
		gap: 0.4rem;
		flex-wrap: wrap;
	}
	button {
		background: #2a2a2a;
		color: #e8e8e8;
		border: 1px solid #3a3a3a;
		border-radius: 6px;
		padding: 0.3rem 0.65rem;
		font-size: 0.82rem;
		cursor: pointer;
	}
	button:hover {
		background: #3a3a3a;
	}
	.hint {
		margin: 0;
		color: #555;
		font-size: 0.8rem;
		font-style: italic;
	}
</style>

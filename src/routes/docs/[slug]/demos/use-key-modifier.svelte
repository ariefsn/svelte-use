<script lang="ts">
	import { useKeyModifier } from '$lib/browser/useKeyModifier.svelte.js';

	const ctrl = useKeyModifier('ctrl');
	const shift = useKeyModifier('shift');
	const alt = useKeyModifier('alt');
	const meta = useKeyModifier('meta');

	const modifiers = [
		{ label: 'Ctrl', getter: ctrl },
		{ label: 'Shift', getter: shift },
		{ label: 'Alt', getter: alt },
		{ label: 'Meta', getter: meta }
	];
</script>

<div class="demo-wrap">
	<p class="hint">Hold modifier keys — each indicator lights up in real time.</p>
	<div class="mod-grid">
		{#each modifiers as m}
			<div class="mod-card" class:active={m.getter()}>
				<span class="mod-label">{m.label}</span>
				<span class="mod-status">{m.getter() ? 'held' : 'up'}</span>
			</div>
		{/each}
	</div>
</div>

<style>
	.mod-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.5rem;
		margin-top: 0.5rem;
	}
	.mod-card {
		padding: 0.75rem 1rem;
		border-radius: 8px;
		border: 1px solid #2e2e2e;
		background: #1a1a1a;
		display: flex;
		justify-content: space-between;
		align-items: center;
		transition: all 0.1s;
	}
	.mod-card.active {
		background: #1a1630;
		border-color: #a78bfa;
	}
	.mod-label {
		font-family: monospace;
		font-size: 0.9rem;
		color: #aaa;
	}
	.mod-card.active .mod-label {
		color: #c4b5fd;
	}
	.mod-status {
		font-size: 0.75rem;
		color: #444;
		font-variant-numeric: tabular-nums;
	}
	.mod-card.active .mod-status {
		color: #a78bfa;
	}
</style>

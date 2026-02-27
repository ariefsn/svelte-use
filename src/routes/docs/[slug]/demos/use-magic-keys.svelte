<script lang="ts">
	import { useMagicKeys } from '$lib/browser/useMagicKeys.svelte.js';

	const keys = useMagicKeys();

	const combos = ['ctrl+k', 'ctrl+shift+s', 'alt+t', 'meta+z'];
	const singles = ['shift', 'ctrl', 'alt', 'meta', 'space', 'esc'];
</script>

<div class="demo-wrap">
	<p class="hint">Press keys — this panel tracks them live.</p>

	<div class="section-label">Modifier keys</div>
	<div class="key-grid">
		{#each singles as k}
			<div class="key-chip" class:active={keys[k]()}>
				<span class="key-name">{k}</span>
			</div>
		{/each}
	</div>

	<div class="section-label">Combos</div>
	<div class="key-grid">
		{#each combos as combo}
			<div class="key-chip wide" class:active={keys[combo]()}>
				<span class="key-name">{combo}</span>
			</div>
		{/each}
	</div>
</div>

<style>
	.section-label {
		font-size: 0.75rem;
		color: #555;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin: 0.75rem 0 0.4rem;
	}
	.key-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	.key-chip {
		padding: 0.3rem 0.65rem;
		border-radius: 6px;
		border: 1px solid #2e2e2e;
		background: #1a1a1a;
		transition: all 0.1s;
		min-width: 60px;
		text-align: center;
	}
	.key-chip.wide {
		min-width: 110px;
	}
	.key-chip.active {
		background: #1a1630;
		border-color: #a78bfa;
	}
	.key-name {
		font-family: monospace;
		font-size: 0.8rem;
		color: #777;
	}
	.key-chip.active .key-name {
		color: #a78bfa;
	}
</style>

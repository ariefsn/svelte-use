<script lang="ts">
	import { useMagicKeys } from '$lib/browser/useMagicKeys.svelte.js';

	const keys = useMagicKeys();

	const combos = ['ctrl+k', 'ctrl+shift+s', 'alt+t', 'meta+z'];
	const singles = ['shift', 'ctrl', 'alt', 'meta', 'space', 'esc'];
</script>

<div class="demo-wrap">
	<p class="hint">Press keys — this panel tracks them live.</p>

	<div class="text-text-faint mt-3 mb-1.5 text-[0.75rem] tracking-[0.06em] uppercase">
		Modifier keys
	</div>
	<div class="flex flex-wrap gap-1.5">
		{#each singles as k (k)}
			<div
				class="min-w-[60px] rounded-md border px-2.5 py-1.5 text-center transition-all duration-100 {keys[
					k
				]()
					? 'bg-accent-bg border-accent'
					: 'bg-surface border-border'}"
			>
				<span class="font-mono text-[0.8rem] {keys[k]() ? 'text-accent' : 'text-text-muted'}"
					>{k}</span
				>
			</div>
		{/each}
	</div>

	<div class="text-text-faint mt-3 mb-1.5 text-[0.75rem] tracking-[0.06em] uppercase">Combos</div>
	<div class="flex flex-wrap gap-1.5">
		{#each combos as combo (combo)}
			<div
				class="min-w-[110px] rounded-md border px-2.5 py-1.5 text-center transition-all duration-100 {keys[
					combo
				]()
					? 'bg-accent-bg border-accent'
					: 'bg-surface border-border'}"
			>
				<span class="font-mono text-[0.8rem] {keys[combo]() ? 'text-accent' : 'text-text-muted'}">
					{combo}
				</span>
			</div>
		{/each}
	</div>
</div>

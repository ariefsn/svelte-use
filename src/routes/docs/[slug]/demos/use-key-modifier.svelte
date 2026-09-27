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
	<div class="mt-2 grid grid-cols-2 gap-2">
		{#each modifiers as m (m)}
			<div
				class="flex items-center justify-between rounded-lg border px-4 py-3 transition-all duration-100 {m.getter()
					? 'bg-accent-bg border-accent'
					: 'bg-surface border-border'}"
			>
				<span class="font-mono text-[0.9rem] {m.getter() ? 'text-accent-strong' : 'text-text-dim'}"
					>{m.label}</span
				>
				<span class="text-[0.75rem] tabular-nums {m.getter() ? 'text-accent' : 'text-text-faint'}"
					>{m.getter() ? 'held' : 'up'}</span
				>
			</div>
		{/each}
	</div>
</div>

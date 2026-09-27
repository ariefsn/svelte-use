<script lang="ts">
	import { useBreakpoints } from '$lib';

	const bp = useBreakpoints({ sm: 640, md: 768, lg: 1024, xl: 1280 });
</script>

<div class="demo-wrap">
	<p class="hint">Resize your browser window to see the active breakpoints change.</p>

	<div class="grid grid-cols-4 gap-2">
		{#each ['sm', 'md', 'lg', 'xl'] as key (key)}
			<div
				class="flex flex-col gap-[0.15rem] rounded-lg border px-3 py-2.5 transition-colors {bp.is(
					key
				)
					? 'bg-accent-bg border-accent'
					: 'bg-surface border-border'}"
			>
				<span
					class="font-mono text-[0.88rem] font-semibold {bp.is(key)
						? 'text-accent'
						: 'text-text-dim'}"
				>
					{key}
				</span>
				<span class="text-text-faint text-[0.75rem]"
					>{key === 'sm' ? '640' : key === 'md' ? '768' : key === 'lg' ? '1024' : '1280'}px</span
				>
				<span class="text-[0.8rem] {bp.is(key) ? 'text-success' : 'text-text-faint'}"
					>{bp.is(key) ? '✓' : '–'}</span
				>
			</div>
		{/each}
	</div>

	<div class="flex items-center gap-3 text-[0.88rem]">
		<span class="label">active</span>
		<span class="value">{bp.active().length ? bp.active().join(', ') : 'none'}</span>
	</div>
</div>

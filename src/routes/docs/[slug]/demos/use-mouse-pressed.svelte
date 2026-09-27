<script lang="ts">
	import { useMousePressed } from '$lib/browser/useMousePressed.svelte.js';

	const pressed = useMousePressed();
</script>

<div class="demo-wrap">
	<p class="hint">Hold any mouse button anywhere on the page.</p>

	<div
		class="flex items-center gap-3 rounded-lg border px-5 py-4 text-[0.95rem] transition-all duration-100 select-none {pressed()
			? 'border-accent bg-accent-bg text-accent-strong'
			: 'border-border bg-surface text-text-muted'}"
	>
		<div
			class="h-2.5 w-2.5 shrink-0 rounded-full transition-colors duration-100 {pressed()
				? 'bg-accent shadow-[0_0_6px_var(--color-accent)]'
				: 'bg-border-strong'}"
		></div>
		<span>{pressed() ? 'Mouse is pressed' : 'Mouse is released'}</span>
	</div>
</div>

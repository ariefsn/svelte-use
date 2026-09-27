<script lang="ts">
	import { useOnline } from '$lib';

	const isOnline = useOnline();
</script>

<div class="demo-wrap">
	<div
		class="flex w-fit items-center gap-2.5 rounded-lg border px-4 py-3 transition-all duration-200 {isOnline()
			? 'border-success-border bg-success-bg'
			: 'border-danger-border bg-danger-bg'}"
	>
		<span
			class="h-2.5 w-2.5 shrink-0 rounded-full transition-colors duration-200 {isOnline()
				? 'bg-success shadow-[0_0_6px_var(--color-success)]'
				: 'bg-danger'}"
		></span>
		<span class="text-[0.9rem] font-semibold {isOnline() ? 'text-success' : 'text-danger'}"
			>{isOnline() ? 'Online' : 'Offline'}</span
		>
	</div>

	<p class="hint">
		Toggle your network connection (or use browser DevTools → Network → Offline) to see the state
		change.
	</p>
</div>

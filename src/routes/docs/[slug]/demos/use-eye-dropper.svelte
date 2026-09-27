<script lang="ts">
	import { useEyeDropper } from '$lib/browser/useEyeDropper.svelte.js';
	const { isSupported, current, open } = useEyeDropper();
</script>

<div class="demo-wrap">
	{#if isSupported()}
		<div class="row">
			<span class="label">picked color</span>
			<span class="value accent">{current() ?? 'none'}</span>
		</div>
		{#if current()}
			<div
				class="border-border-strong h-[60px] w-[60px] rounded-lg border"
				style="background:{current()}"
			></div>
		{/if}
		<div class="actions">
			<button onclick={() => open()}>Pick Color</button>
		</div>
	{:else}
		<p class="hint">EyeDropper API is not supported in this browser.</p>
	{/if}
</div>

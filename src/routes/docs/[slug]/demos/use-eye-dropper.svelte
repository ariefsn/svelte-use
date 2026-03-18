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
			<div style="width:60px;height:60px;border-radius:8px;background:{current()};border:1px solid #333"></div>
		{/if}
		<div class="actions">
			<button onclick={() => open()}>Pick Color</button>
		</div>
	{:else}
		<p class="hint">EyeDropper API is not supported in this browser.</p>
	{/if}
</div>

<script lang="ts">
	import { useShare } from '$lib/browser/useShare.svelte.js';
	const { isSupported, share } = useShare();
	let result = $state('');
</script>
<div class="demo-wrap">
	<div class="row">
		<span class="label">supported</span>
		<span class="value accent">{isSupported()}</span>
	</div>
	{#if result}
		<div class="row">
			<span class="label">result</span>
			<span class="value accent">{result}</span>
		</div>
	{/if}
	<div class="actions">
		<button
			onclick={async () => {
				const ok = await share({ title: 'Svelte Use', text: 'Check out svelte-use!', url: location.href });
				result = ok ? 'Shared!' : 'Cancelled';
			}}
			disabled={!isSupported()}
		>Share this page</button>
	</div>
	<p class="hint">Uses the native Web Share API (mobile/desktop).</p>
</div>

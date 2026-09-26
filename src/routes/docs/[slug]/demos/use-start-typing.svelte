<script lang="ts">
	import { useStartTyping } from '$lib/browser/interaction/useStartTyping.svelte.js';
	let input = $state<HTMLInputElement | null>(null);
	let lastKey = $state('');
	useStartTyping((e) => {
		lastKey = e.key;
		input?.focus();
	});
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">last key</span>
		<span class="value accent">{lastKey || '(none)'}</span>
	</div>
	<input
		bind:this={input}
		placeholder="Auto-focused on typing…"
		class="bg-bg border-border-strong text-text w-full rounded border px-2 py-2"
	/>
	<p class="hint">
		Start typing anywhere on the page (not in an input) and this input will auto-focus.
	</p>
</div>

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
	<input bind:this={input} placeholder="Auto-focused on typing…" style="background:#111;border:1px solid #333;padding:0.5rem;border-radius:4px;color:#eee;width:100%" />
	<p class="hint">Start typing anywhere on the page (not in an input) and this input will auto-focus.</p>
</div>

<script lang="ts">
	import { useTextSelection } from '$lib/browser/useTextSelection.svelte.js';
	const { text, rects } = useTextSelection();
</script>
<div class="demo-wrap">
	<div class="row">
		<span class="label">selected text</span>
		<span class="value accent">{text() || '(none)'}</span>
	</div>
	<div class="row">
		<span class="label">selection rects</span>
		<span class="value accent">{rects().length}</span>
	</div>
	<p style="color:#888;line-height:1.6">Select some of this text to see the selection tracked in real-time. Try selecting across multiple lines to see multiple rects.</p>
	<p class="hint">Tracks text selection via the Selection API.</p>
</div>

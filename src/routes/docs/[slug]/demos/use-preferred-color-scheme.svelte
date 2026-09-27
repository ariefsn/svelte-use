<script lang="ts">
	import { usePreferredColorScheme } from '$lib';

	const scheme = usePreferredColorScheme();
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">scheme</span>
		<span class="value accent">{scheme()}</span>
	</div>
	<p class="hint">
		Two media queries rather than one, so an explicit <code>light</code> preference stays
		distinguishable from <code>no-preference</code> — which is what an older engine or an embedded webview
		reports.
	</p>
</div>

<script lang="ts">
	import { useWindowFocus } from '$lib/browser/sensors/useWindowFocus.svelte.js';
	const { focused } = useWindowFocus();
</script>
<div class="demo-wrap">
	<div class="row">
		<span class="label">window focused</span>
		<span class="value accent">{focused()}</span>
	</div>
	<p class="hint">Click outside the browser window to see it change to false.</p>
</div>

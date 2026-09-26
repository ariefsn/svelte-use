<script lang="ts">
	import { usePreferredContrast } from '$lib';

	const contrast = usePreferredContrast();
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">contrast</span>
		<span class="value accent">{contrast()}</span>
	</div>
	<p class="hint">
		Combines three queries. A forced-colours mode often matches both <code>custom</code> and
		<code>more</code>, so <code>custom</code> is checked last and the more actionable answer wins.
	</p>
</div>

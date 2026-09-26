<script lang="ts">
	import { usePreferredDark } from '$lib';

	const prefersDark = usePreferredDark();
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">prefers dark</span>
		<span class="value accent">{prefersDark()}</span>
	</div>
	<p class="hint">
		Change your operating system between light and dark appearance to watch this flip. It reports
		<code>false</code> during SSR and until hydration.
	</p>
</div>
